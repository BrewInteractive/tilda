import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { ConfigService } from '@nestjs/config';
import { ManifestRequest } from './models';
import { generateHmac, verifyHmac } from '../utils/crypto-helpers';
import {
  GetManifestError,
  InvalidValidationError,
} from './errors/manifest.error';
import {
  EncryptionError,
  HmacError,
} from '../utils/errors/crypto-helpers.error';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ValidationService } from '../validation/validation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DisableApiKey } from '../utils/decorators/disable-api-key/disable-api-key.decorator';
import { EmailRequest } from '../hook/models';
import { HookType } from '../models';

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
  @ApiSecurity('ApiKey')
  async hash(
    @Body() manifestInput: ManifestRequest,
    @Res() res,
  ): Promise<void> {
    try {
      const manifestResponse =
        await this.manifestService.getManifest(manifestInput);

      let manifest = manifestResponse;

      const isManifestValid = this.manifestService.validateManifest(manifest);
      if (!isManifestValid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Invalid manifest' });
      }

      manifest = this.manifestService.encryptManifestEncFields(
        manifest,
        this.secretKey,
      );

      const hmacValue = generateHmac(manifest.data, this.secretKey);
      manifest.hmac = hmacValue;
      return res.status(HttpStatus.OK).json(manifest);
    } catch (error) {
      if (
        error instanceof GetManifestError ||
        error instanceof HmacError ||
        error instanceof EncryptionError
      ) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: error.message });
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
      }
    }
  }

  @Post('validate')
  @UseInterceptors(FileInterceptor('manifest'))
  @DisableApiKey()
  async validate(@Body() manifestInput: any, @Res() res): Promise<void> {
    try {
      const { url, base64, prehookSignatures, ...payload } = manifestInput;
      const prehookSignaturesArray = Array.isArray(prehookSignatures)
        ? prehookSignatures
        : [prehookSignatures];

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
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Invalid manifest' });
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

      this.manifestService.setWebhookParamsValues(manifestResponse, payload);
      const dataWithUi = this.manifestService.getDataWithUiLabels(
        manifestResponse,
        payload,
      );
      const manifestWithPreSignatures =
        this.manifestService.addSignatureToPreHooks(
          manifestResponse,
          prehookSignaturesArray,
        );
      const preHooksResults = await this.manifestService.handlePreHooks(
        manifestWithPreSignatures.data.hooks.pre,
        this.secretKey,
      );

      const preHookResultsWithSuccess =
        this.manifestService.processPreHooksResultsSuccess(
          preHooksResults,
          manifestWithPreSignatures,
        );

      if (
        preHookResultsWithSuccess &&
        preHookResultsWithSuccess.filter(
          (hook) =>
            (hook.success != undefined && !hook.success) ||
            (hook.response && hook.response.status != 200),
        ).length > 0
      ) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ validationResult, hook: { pre: preHookResultsWithSuccess } });
      }

      manifestResponse.data.hooks.post
        .filter((x) => x.factory === HookType.email)
        .forEach(async (hook) => {
          (hook.params as EmailRequest).dataWithUi = dataWithUi;
        });

      await this.manifestService.handlePostHooks(
        manifestWithPreSignatures.data.hooks.post,
      );

      return res
        .status(HttpStatus.OK)
        .json({ validationResult, hook: { pre: preHookResultsWithSuccess } });
    } catch (error) {
      if (
        error instanceof InvalidValidationError ||
        error instanceof HmacError
      ) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ errors: error.message });
      } else
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ error: error.message });
    }
  }
}
