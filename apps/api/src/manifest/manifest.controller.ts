import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { TildaManifest } from '../models';
import { ManifestService } from './manifest.service';
import { ConfigService } from '@nestjs/config';
import { ManifestRequest } from './models/manifest-request.model';
import { generateHmac, verifyHmac } from '../utils/crypto-helpers';
import {
  GetManifestError,
  InvalidValidationError,
} from './errors/manifest.error';
import {
  EncryptionError,
  HmacError,
} from '../utils/errors/crypto-helpers.error';
import { ApiTags } from '@nestjs/swagger';
import { ValidationService } from '../validation/validation.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('manifest')
@Controller('manifest')
export class ManifestController {
  private secretKey: string;
  constructor(
    private readonly manifestService: ManifestService,
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
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

  @Post('validate')
  @UseInterceptors(FileInterceptor('manifest'))
  async validate(@Body() manifestInput: any, @Res() res): Promise<void> {
    try {
      const { url, base64, ...payload } = manifestInput;

      const manifestInfo: ManifestRequest = {
        url,
        base64,
      };

      let manifestResponse =
        await this.manifestService.getManifest(manifestInfo);

      const isHashValid = verifyHmac(
        manifestResponse.data,
        this.secretKey,
        manifestResponse.hmac,
      );

      if (!isHashValid) {
        throw new HmacError(`Hash is not valid`);
      }

      manifestResponse = this.manifestService.decryptManifestEncFields(
        manifestResponse,
        this.secretKey,
      );

      const isManifestValid =
        this.manifestService.validateManifest(manifestResponse);

      if (!isManifestValid) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid manifest' });
      }

      const validationResult = this.validationService.validate(
        payload,
        manifestResponse.data,
      );

      if (!validationResult.success) {
        throw new InvalidValidationError(
          validationResult.errors
            .map((error) => `${error.message} (Path: ${error.path})`)
            .join(', '),
        );
      }

      await this.manifestService.handlePostHooks(
        manifestResponse.data.hooks.post,
      );

      res.status(HttpStatus.OK).json(validationResult);
    } catch (error) {
      if (
        error instanceof InvalidValidationError ||
        error instanceof HmacError
      ) {
        res.status(HttpStatus.BAD_REQUEST).json({ errors: error.message });
      } else
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
    }
  }
}
