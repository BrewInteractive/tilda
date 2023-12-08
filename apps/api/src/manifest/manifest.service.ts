import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TildaManifest } from '../models';
import { ManifestRequest } from './models/manifest-request.model';
import { InputError, ProcessingError } from './errors/manifest.error';

@Injectable()
export class ManifestService {
  constructor(private httpService: HttpService) {}

  async getManifest(
    manifestInput: ManifestRequest,
  ): Promise<TildaManifest | null> {
    if (!manifestInput.url && !manifestInput.base64) {
      throw new InputError(`One of url or base64 should be provided`);
    }
    return manifestInput.url
      ? await this.getManifestFromUrl(manifestInput.url)
      : await this.getManifestFromBase64(manifestInput.base64);
  }

  async getManifestFromUrl(url: string): Promise<TildaManifest> {
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      if (response.status !== 200) {
        throw new ProcessingError(
          `Error: Invalid status received (${response.status}) while fetching URL`,
        );
      }
      return response.data as TildaManifest;
    } catch (error) {
      throw new ProcessingError(`Error fetching URL ${error.message}`);
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
        throw new ProcessingError(`Error decoding base64 ${error.message}`);
      }
    }
  }
}
