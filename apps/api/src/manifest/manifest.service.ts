import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  EmailParams,
  EmailRecipient,
  Field,
  Hook,
  TildaManifest,
} from '../models';
import { ManifestRequest } from './models/manifest-request.model';
import { GetManifestError } from './errors/manifest.error';
import { encrypt } from '../utils/crypto-helpers';
import TildaManifestSchema from './manifest.schema';
import Ajv from 'ajv';

@Injectable()
export class ManifestService {
  constructor(private httpService: HttpService) {}

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

  validateManifest = (manifest: TildaManifest): boolean => {
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(TildaManifestSchema);

    const isValid = validate(manifest);

    return isValid;
  };
}
