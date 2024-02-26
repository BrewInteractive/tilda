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
import { decrypt, encrypt } from '../utils/crypto-helpers';
import TildaManifestSchema from './manifest.schema';
import Ajv from 'ajv';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { HookService } from '../hook/hook.service';
import { HookFactory } from '../hook/hook.factory';

@Injectable()
export class ManifestService {
  constructor(
    private httpService: HttpService,
    @Inject('Ajv')
    private readonly ajv: Ajv,
    @InjectQueue('hook-queue') private readonly hookQueue: Queue,
    private readonly hookService: HookService,
  ) {}

  async handlePostHooks(hooks: Hook[], dataWithUi?: any): Promise<any> {
    for (const hook of hooks) {
      await this.hookQueue.add({ hook: hook, dataWithUi: dataWithUi });
    }
  }
  async handlePreHooks(hooks: Hook[]): Promise<any> {
    const preHookResult = [];
    for (const hook of hooks) {
      const { factory, params } = hook;
      const result = await HookFactory.getHook(
        factory,
        this.hookService,
      ).execute(params);
      preHookResult.push(result);
    }
    return preHookResult;
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
    payload,
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
      const originalValue = value as string;
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

  setWebhookParamsValues = (manifest: TildaManifest, payload): void => {
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

  getDataWithUiLabels = (manifest: TildaManifest, payload): any[] => {
    const dataWithUiLabels = [];
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
