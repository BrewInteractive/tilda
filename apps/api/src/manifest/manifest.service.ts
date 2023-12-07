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
import { CustomException, ExceptionType } from './exceptions';
import { encrypt } from '../utils/crypto-helpers';

@Injectable()
export class ManifestService {
  constructor(private httpService: HttpService) {}

  async getManifest(
    manifestInput: ManifestRequest,
  ): Promise<TildaManifest | null> {
    if (manifestInput.url && manifestInput.base64) {
      throw new CustomException(ExceptionType.onlyOneProvided);
    }
    if (!manifestInput.url && !manifestInput.base64) {
      throw new CustomException(ExceptionType.oneOfProvided);
    }
    return manifestInput.url
      ? await this.getManifestFromUrl(manifestInput.url)
      : await this.getManifestFromBase64(manifestInput.base64);
  }

  async getManifestFromUrl(url: string): Promise<TildaManifest> {
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      if (response.status !== 200) {
        throw new CustomException(ExceptionType.errorFetchingURL);
      }
      return response.data as TildaManifest;
    } catch (error) {
      throw new CustomException(ExceptionType.errorFetchingURL);
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
        throw new CustomException(ExceptionType.errorDecodingBase64);
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
}
