import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  Constants,
  DataWithUiLabels,
  EmailParams,
  EmailRecipient,
  Field,
  Hook,
  HookType,
  TildaManifest,
} from '../models';
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
import { HookFactory } from '../hook/hook.factory';
import { PreHookResponse, ManifestRequest } from './models';

@Injectable()
export class ManifestService {
  constructor(
    private httpService: HttpService,
    @Inject('Ajv')
    private readonly ajv: Ajv,
    @InjectQueue('hook-queue') private readonly hookQueue: Queue,
    private readonly hookFactory: HookFactory,
  ) {}

  async handlePostHooks(hooks: Hook[]): Promise<void> {
    for (const hook of hooks) {
      await this.hookQueue.add({ hook: hook });
    }
  }
  async handlePreHooks(
    hooks: Hook[],
    secretKey: string,
  ): Promise<PreHookResponse[]> {
    const preHookResult: PreHookResponse[] = [];
    for (const hook of hooks) {
      const { signature, factory, params, id, ignoreSuccess } = hook;

      let isHashValid = false;
      if (signature !== undefined && signature !== null && signature !== '') {
        isHashValid = verifyHmac({ factory, params }, secretKey, signature);
      }

      if (!isHashValid) {
        const result = await this.hookFactory
          .getProcessor(factory)
          .execute(params);
        const newSignature = generateHmac({ factory, params }, secretKey);
        preHookResult.push({
          id,
          ignoreSuccess,
          signature: newSignature,
          success: result?.success,
          ...result,
        });
      } else {
        preHookResult.push({
          id,
          ignoreSuccess,
          success: false,
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
    if (
      !manifestInput.url &&
      !manifestInput.base64 &&
      !manifestInput.manifest
    ) {
      throw new GetManifestError(`One of url or base64 should be provided`);
    }
    return manifestInput.manifest
      ? manifestInput.manifest
      : manifestInput.base64
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
      recipient[Constants.emailSuffix] = encrypt(
        recipient[Constants.emailSuffix],
        secret,
      );
    });
  };

  encryptFieldConstValues = (field: Field, secret: string): void => {
    Object.keys(field.const).forEach((constKey: string) => {
      const constValue = field.const[constKey];
      if (constKey.endsWith(Constants.encryptSuffix)) {
        field.const[constKey] = encrypt(constValue, secret);
      }
    });
  };

  encryptManifestEncFields = (
    manifest: TildaManifest,
    secret: string,
  ): TildaManifest => {
    manifest.data.hooks.post.forEach((hook: Hook) => {
      if (hook.factory === HookType.email) {
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
      recipient[Constants.emailSuffix] = decrypt(
        recipient[Constants.emailSuffix],
        secret,
      );
    });
  };

  decryptManifestEncFields = (
    manifest: TildaManifest,
    secret: string,
  ): TildaManifest => {
    manifest.data.hooks.post.forEach((hook: Hook) => {
      if (hook.factory === HookType.email) {
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
      if (constKey.endsWith(Constants.encryptSuffix)) {
        field.const[constKey] = decrypt(constValue, secret);
      }
    });
  };

  validateManifest = (manifest: TildaManifest): boolean => {
    const validate = this.ajv.compile(TildaManifestSchema);

    const isValid = validate(manifest);

    if (validate.errors)
      console.info('validateManifest errors', validate.errors);

    return isValid;
  };

  generateHookTemplateKeyPairs = (
    manifest: TildaManifest,
    payload: { [key: string]: string },
  ): { [key: string]: string } => {
    //merge payload and const values of fields
    const combinedPayload = { ...payload };

    for (const fieldKey in manifest.data.fields) {
      if (manifest.data.fields.hasOwnProperty(fieldKey)) {
        const field = manifest.data.fields[fieldKey];
        const fieldName = field.inputName || fieldKey;

        //if field has input name override the key with input name
        if (field.inputName) {
          combinedPayload[field.inputName] =
            payload[field.inputName] || payload[fieldKey];
          if (!combinedPayload[fieldKey])
            combinedPayload[fieldKey] = payload[field.inputName];
        }

        for (const constKey in field.const) {
          const constValue = field.const[constKey];
          combinedPayload[`${fieldName}.const.${constKey}`] = constValue;
          combinedPayload[`${fieldKey}.const.${constKey}`] = constValue;
        }
      }
    }

    return combinedPayload;
  };

  applyTemplateToHooks = (
    manifest: TildaManifest,
    payload: { [key: string]: string },
  ): void => {
    const templateValues = this.generateHookTemplateKeyPairs(manifest, payload);

    const updateHookParameters = (hooks: Hook[]): void => {
      hooks.forEach((hook) => {
        this.hookFactory
          .getTemplating(hook.factory)
          .applyTemplate(hook.params, templateValues);
      });
    };

    updateHookParameters([
      ...manifest.data.hooks.pre,
      ...manifest.data.hooks.post,
    ]);
  };

  getDataWithUiLabels = (
    manifest: TildaManifest,
    payload,
  ): DataWithUiLabels => {
    const dataWithUiLabels: DataWithUiLabels = {};
    for (const payloadName in payload) {
      for (const fieldKey in manifest.data.fields) {
        if (manifest.data.fields.hasOwnProperty(fieldKey)) {
          if (payloadName == fieldKey) {
            dataWithUiLabels[manifest.data.fields[fieldKey].ui.label] =
              payload[payloadName];
            break;
          }
          if (manifest.data.fields[fieldKey].inputName == payloadName) {
            dataWithUiLabels[manifest.data.fields[fieldKey].ui.label] =
              payload[payloadName];
            break;
          }
        }
      }
    }
    return dataWithUiLabels;
  };
}
