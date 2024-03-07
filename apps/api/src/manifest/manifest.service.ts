import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  EmailParams,
  EmailRecipient,
  Field,
  Hook,
  TildaManifest,
  WebhookParams,
} from '../models';
import { ManifestRequest } from './models/manifest-request.model';
import { GetManifestError } from './errors/manifest.error';
import {
  decrypt,
  encrypt,
  generateHmac,
  verifyHmac,
} from '../utils/crypto-helpers';
import TildaManifestSchema from './manifest.schema';
import Ajv from 'ajv';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { HookService } from '../hook/hook.service';
import { HookFactory } from '../hook/hook.factory';
import { DataWithUiLabels, PreHookResponse } from './models';

@Injectable()
export class ManifestService {
  constructor(
    private httpService: HttpService,
    @Inject('Ajv')
    private readonly ajv: Ajv,
    @InjectQueue('hook-queue') private readonly hookQueue: Queue,
    private readonly hookService: HookService,
  ) {}

  async handlePostHooks(
    hooks: Hook[],
    dataWithUi?: DataWithUiLabels[],
  ): Promise<void> {
    for (const hook of hooks) {
      await this.hookQueue.add({ hook: hook, dataWithUi: dataWithUi });
    }
  }
  async handlePreHooks(
    hooks: Hook[],
    secretKey: string,
  ): Promise<PreHookResponse[]> {
    const preHookResult: PreHookResponse[] = [];
    for (const hook of hooks) {
      const { signature, factory, params } = hook;

      let isHashValid = false;
      if (signature !== undefined && signature !== null && signature !== '') {
        isHashValid = verifyHmac({ factory, params }, secretKey, signature);
      }

      if (!isHashValid) {
        const result = await HookFactory.getHook(
          factory,
          this.hookService,
        ).execute(params);
        const newSignature = generateHmac({ factory, params }, secretKey);
        preHookResult.push({ signature: newSignature, ...result });
      } else {
        preHookResult.push({
          message:
            'The pre-hook request was not sent because the signatures are the same',
          ...hook,
        });
      }
    }
    return preHookResult;
  }

  addSignatureToPreHooks(
    manifest: TildaManifest,
    signatures: string[],
  ): TildaManifest {
    const manifestWithPreSignatures = JSON.parse(JSON.stringify(manifest));
    if (signatures) {
      manifestWithPreSignatures.data.hooks.pre.forEach((hook, index) => {
        if (index < signatures.length) {
          hook.signature = signatures[index];
        }
      });
    }
    return manifestWithPreSignatures;
  }

  async getManifest(
    manifestInput: ManifestRequest,
  ): Promise<TildaManifest | null> {
    if (!manifestInput.url && !manifestInput.base64) {
      throw new GetManifestError(`One of url or base64 should be provided`);
    }
    return manifestInput.base64
      ? await this.getManifestFromBase64(manifestInput.base64)
      : await this.getManifestFromUrl(manifestInput.url);
  }

  async getManifestFromUrl(url: string): Promise<TildaManifest> {
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      if (response.status !== 200) {
        throw new GetManifestError(
          `Error: Invalid status received (${response.status}) while fetching URL`,
        );
      }
      return response.data as TildaManifest;
    } catch (error) {
      throw new GetManifestError(`Error fetching URL ${error.message}`);
    }
  }
  async getManifestFromBase64(base64Content: string): Promise<TildaManifest> {
    if (base64Content) {
      try {
        const decodedManifest = Buffer.from(base64Content, 'base64').toString(
          'utf-8',
        );

        return JSON.parse(decodedManifest) as TildaManifest;
      } catch (error) {
        throw new GetManifestError(`Error decoding base64 ${error.message}`);
      }
    }
  }

  encryptManifestEmailRecipients = (
    emailRecipients: EmailRecipient[],
    secret: string,
  ): void => {
    emailRecipients.forEach((recipient) => {
      recipient['email:enc'] = encrypt(recipient['email:enc'], secret);
    });
  };

  encryptFieldConstValues = (field: Field, secret: string): void => {
    Object.keys(field.const).forEach((constKey: string) => {
      const constValue = field.const[constKey];
      if (constKey.endsWith(':enc')) {
        field.const[constKey] = encrypt(constValue, secret);
      }
    });
  };

  encryptManifestEncFields = (
    manifest: TildaManifest,
    secret: string,
  ): TildaManifest => {
    manifest.data.hooks.post.forEach((hook: Hook) => {
      if (hook.factory === 'email') {
        const emailParams: EmailParams = hook.params as EmailParams;
        this.encryptManifestEmailRecipients(emailParams.recipients, secret);
      }
    });

    Object.values(manifest.data.fields).forEach((field: Field) => {
      this.encryptFieldConstValues(field, secret);
    });

    return manifest;
  };

  decryptManifestEmailRecipients = (
    emailRecipients: EmailRecipient[],
    secret: string,
  ): void => {
    emailRecipients.forEach((recipient) => {
      recipient['email:enc'] = decrypt(recipient['email:enc'], secret);
    });
  };

  decryptManifestEncFields = (
    manifest: TildaManifest,
    secret: string,
  ): TildaManifest => {
    manifest.data.hooks.post.forEach((hook: Hook) => {
      if (hook.factory === 'email') {
        const emailParams: EmailParams = hook.params as EmailParams;
        this.decryptManifestEmailRecipients(emailParams.recipients, secret);
      }
    });

    Object.values(manifest.data.fields).forEach((field: Field) => {
      this.decryptFieldConstValues(field, secret);
    });
    return manifest;
  };

  decryptFieldConstValues = (field: Field, secret: string): void => {
    Object.keys(field.const).forEach((constKey: string) => {
      const constValue = field.const[constKey];
      if (constKey.endsWith(':enc')) {
        field.const[constKey] = decrypt(constValue, secret);
      }
    });
  };

  validateManifest = (manifest: TildaManifest): boolean => {
    const validate = this.ajv.compile(TildaManifestSchema);

    const isValid = validate(manifest);

    return isValid;
  };

  generateWebhookKeyValues = (
    manifest: TildaManifest,
    payload: { [key: string]: string },
  ): { [key: string]: string } => {
    const output = { ...payload };

    for (const fieldKey in manifest.data.fields) {
      if (manifest.data.fields.hasOwnProperty(fieldKey)) {
        const field = manifest.data.fields[fieldKey];
        const fieldName = field.inputName || fieldKey;

        if (field.inputName) {
          output[field.inputName] =
            payload[field.inputName] || payload[fieldKey];
          if (!output[fieldKey]) output[fieldKey] = payload[field.inputName];
        }

        for (const constKey in field.const) {
          const constValue = field.const[constKey];
          output[`${fieldName}.const.${constKey}`] = constValue;
          output[`${fieldKey}.const.${constKey}`] = constValue;
        }
      }
    }

    return output;
  };

  transformPatternValues = (
    values: WebhookParams['values'],
    output: { [key: string]: string },
  ): { [key: string]: string } => {
    const transformedValues: { [key: string]: string } = {};
    const valuesCopy = JSON.parse(JSON.stringify(values)) as {
      [key: string]: string;
    };

    Object.entries(valuesCopy).forEach(([key, value]) => {
      const originalValue = value;
      const matches = originalValue.match(/\{(?:\$\.)?fields\.([^}]+)\}/g);
      if (matches) {
        let transformedValue = originalValue;
        matches.forEach((match) => {
          const field = match
            .replace(/\{(?:\$\.)?fields\.([^}]+)\}/, '$1')
            .replace('.value', '')
            .replace(':enc', '');
          transformedValue = transformedValue.replace(
            match,
            output[field] || output[`${field}:enc`] || '',
          );
        });
        transformedValues[key] = transformedValue;
      } else {
        transformedValues[key] = value;
      }
    });
    return transformedValues;
  };

  setWebhookParamsValues = (
    manifest: TildaManifest,
    payload: { [key: string]: string },
  ): void => {
    const output = this.generateWebhookKeyValues(manifest, payload);

    const transformHookParamsValues = (hooks: Hook[]): void => {
      hooks.forEach((hook) => {
        if (
          hook.factory === 'webhook' &&
          hook.params &&
          (hook.params as WebhookParams).values
        ) {
          (hook.params as WebhookParams).values = this.transformPatternValues(
            (hook.params as WebhookParams).values,
            output,
          );
        }
      });
    };

    transformHookParamsValues(manifest.data.hooks.pre);
    transformHookParamsValues(manifest.data.hooks.post);
  };

  getDataWithUiLabels = (
    manifest: TildaManifest,
    payload,
  ): DataWithUiLabels[] => {
    const dataWithUiLabels: DataWithUiLabels[] = [];
    for (const payloadName in payload) {
      for (const fieldKey in manifest.data.fields) {
        if (manifest.data.fields.hasOwnProperty(fieldKey)) {
          if (payloadName == fieldKey) {
            dataWithUiLabels.push({
              [manifest.data.fields[fieldKey].ui.label]: payload[payloadName],
            });
            break;
          }
          if (manifest.data.fields[fieldKey].inputName == payloadName) {
            dataWithUiLabels.push({
              [manifest.data.fields[fieldKey].ui.label]: payload[payloadName],
            });
            break;
          }
        }
      }
    }
    return dataWithUiLabels;
  };
}
