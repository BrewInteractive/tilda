import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TildaManifest } from '../models';
import { ManifestRequest } from './models/manifest-request.model';
import { GetManifestError } from './errors/manifest.error';

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
      throw new GetManifestError(`Error fetching URL: ${error.message}`);
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
}
