import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { TildaManifest } from '../models';
import { ManifestService } from './manifest.service';
import { ConfigService } from '@nestjs/config';
import { ManifestRequest } from './models/manifest-request.model';
import { generateHmac } from '../utils/crypto-helpers';
import { GetManifestError } from './errors/manifest.error';
import {
  EncryptionError,
  HmacError,
} from '../utils/errors/crypto-helpers.error';

@Controller('manifest')
export class ManifestController {
  private secretKey: string;
  constructor(
    private readonly manifestService: ManifestService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.get<string>('ENCRYPTION_SECRET');
  }
  @Post('hash')
  async hash(
    @Body() manifestInput: ManifestRequest,
    @Res() res,
  ): Promise<void> {
    try {
      const manifestResponse =
        await this.manifestService.getManifest(manifestInput);

      let manifest = manifestResponse as TildaManifest;

      const isManifestValid = this.manifestService.validateManifest(manifest);
      if (!isManifestValid) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid manifest' });
      }

      manifest = this.manifestService.encryptManifestEncFields(
        manifest,
        this.secretKey,
      );

      const hmacValue = generateHmac(manifest.data, this.secretKey);
      manifest.hmac = hmacValue;
      res.status(HttpStatus.OK).json(manifest);
    } catch (error) {
      if (
        error instanceof GetManifestError ||
        error instanceof HmacError ||
        error instanceof EncryptionError
      ) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
      } else {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      }
    }
  }
}
