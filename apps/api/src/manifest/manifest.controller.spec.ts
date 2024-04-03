import { EmailParams, WebhookParams } from '../models';
import { ManifestRequest, PreHookResponse } from './models';
import { Test, TestingModule } from '@nestjs/testing';
import { generateHmac, verifyHmac } from '../utils/crypto-helpers';

import Ajv from 'ajv';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from '../hook/email.processor';
import { HookProcessorFactory } from '../hook/hook.factory';
import { HookService } from '../hook/hook.service';
import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { ManifestController } from './manifest.controller';
import { ManifestService } from './manifest.service';
import { MockFactory } from 'mockingbird';
import { SmtpEmailConfig } from '../email/providers/smtp-email.config';
import { SmtpEmailService } from '../email/providers/smtp-email.service';
import { TildaManifestFixture } from '../../test/fixtures/manifest/tilda-manifest.fixture';
import { ValidationModule } from '../validation/validation.module';
import { ValidationService } from '../validation/validation.service';
import { WebhookProcessor } from '../hook/webhook.processor';
import { faker } from '@faker-js/faker';

jest.mock('../utils/crypto-helpers', () => ({
  generateHmac: jest.fn(),
  verifyHmac: jest.fn(),
}));
describe('ManifestController', () => {
  let manifestController: ManifestController;
  let manifestService: ManifestService;
  let validationService: ValidationService;
  let hookServiceMock: Partial<HookService>;

  const validManifest = MockFactory(TildaManifestFixture).one();
  const encryptedValidManifest = MockFactory(TildaManifestFixture).one();
  encryptedValidManifest.hmac =
    '44a98ec59c22d24b6b6a612b4acd90f68180237412e4c3e01dd1f913542dc9c4';
  (
    encryptedValidManifest.data.hooks.post[0].params as EmailParams
  ).recipients[0]['email:enc'] =
    '24b5b244948a45caa4415a15:9283a0fdfbbb6e3a804fe5ebb938bfcf:872cc965688f2299bc67cd67105423c1';
  (
    encryptedValidManifest.data.hooks.pre[0].params as WebhookParams
  ).success_path = '$.response.success';
  encryptedValidManifest.data.fields['name'].const['constName1'] =
    'const value';
  encryptedValidManifest.data.fields['surname'].const['constName2:enc'] =
    'd2f9641add34ca1f65f20d38:efb52d71d555b6183b4eeaa8d21341:683dd0ae0f63f87f0a54d05d1563d5a7';

  beforeEach(async () => {
    hookServiceMock = {
      sendEmailAsync: jest.fn(),
      sendWebhookAsync: jest.fn(),
    };
    const config = {
      host: faker.internet.url(),
      port: faker.number.int(),
      secure: faker.datatype.boolean(),
      auth: {
        user: faker.internet.email(),
        pass: faker.internet.password(),
      },
    } as SmtpEmailConfig;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController],
      imports: [
        ValidationModule,
        BullModule.registerQueue({
          name: 'hook-queue',
        }),
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            get: jest.fn().mockImplementation((_: string) => {
              return 'SMTP';
            }),
          },
        },
        {
          provide: SmtpEmailConfig,
          useValue: config,
        },
        ValidationService,
        {
          provide: HookService,
          useValue: hookServiceMock,
        },
        {
          provide: HttpService,
          useValue: {},
        },
        ManifestService,
        { provide: 'Ajv', useValue: new Ajv({ allErrors: true }) },
        {
          provide: HookProcessorFactory,
          useValue: {
            getProcessor: jest.fn(),
          },
        },
        {
          provide: EmailProcessor,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: WebhookProcessor,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: SmtpEmailService,
          useValue: {
            sendEmailAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    manifestController = module.get<ManifestController>(ManifestController);
    manifestService = module.get<ManifestService>(ManifestService);
    validationService = module.get<ValidationService>(ValidationService);
  });
  it('Should be defined', () => {
    expect(manifestController).toBeDefined();
  });

  it('should hash manifest and return JSON with HMAC', async () => {
    const mockManifestRequest: ManifestRequest = {
      url: faker.internet.url.toString(),
    };

    jest.spyOn(manifestService, 'getManifest').mockResolvedValue(validManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest
      .spyOn(manifestService, 'encryptManifestEncFields')
      .mockReturnValue(validManifest);

    const mockHmacValue = faker.string.alpha(10);
    (generateHmac as jest.Mock).mockImplementation(() => mockHmacValue);
    validManifest.hmac = mockHmacValue;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.hash(mockManifestRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      ...validManifest,
    });
  });

  it('should handle errors invalid manifest request and return JSON with error message', async () => {
    const mockManifestRequest: ManifestRequest = {};

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.hash(mockManifestRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'One of url or base64 should be provided',
    });
  });
  it('should handle errors invalid manifest and return JSON with error message', async () => {
    const mockManifestRequest: ManifestRequest = {
      url: faker.internet.url.toString(),
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      message: jest.fn(),
    };

    jest.spyOn(manifestService, 'getManifest').mockResolvedValue(validManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(false);

    await manifestController.hash(mockManifestRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid manifest',
    });
  });
  it('should return internal server error', async () => {
    jest
      .spyOn(manifestController['manifestService'], 'getManifest')
      .mockRejectedValue(new Error('Server error'));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.hash({}, res as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Server error',
    });
  });
  it('should validate manifest and return validation result', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
      prehookSignatures: [faker.string.alpha(10)],
    };
    const preHookResultWithSuccess = [
      {
        response: {
          data: faker.string.alpha(),
          success: true,
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
        success: true,
      } as PreHookResponse,
    ];
    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest
      .spyOn(manifestService, 'getDataWithUiLabels')
      .mockReturnValue(undefined);
    jest
      .spyOn(manifestService, 'addSignatureToPreHooks')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'handlePostHooks').mockResolvedValue();
    jest
      .spyOn(manifestService, 'handlePreHooks')
      .mockResolvedValue(preHookResultWithSuccess);
    jest.spyOn(validationService, 'validate').mockReturnValue({
      success: true,
    });
    (verifyHmac as jest.Mock).mockReturnValue(true);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(manifestService.addSignatureToPreHooks).toHaveBeenCalledWith(
      encryptedValidManifest,
      mockManifestInput.prehookSignatures,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      validationResult: { success: true },
      hook: { pre: preHookResultWithSuccess },
    });
  });
  it('should validate manifest and pre hook result 200 but got success false return validation result bad request', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
      prehookSignatures: [faker.string.alpha(10)],
    };
    const preHookResultWithSuccess = [
      {
        response: {
          data: faker.string.alpha(),
          success: false,
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
        success: false,
      },
    ];
    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest
      .spyOn(manifestService, 'getDataWithUiLabels')
      .mockReturnValue(undefined);
    jest
      .spyOn(manifestService, 'addSignatureToPreHooks')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'handlePostHooks').mockResolvedValue();
    jest
      .spyOn(manifestService, 'handlePreHooks')
      .mockResolvedValue(preHookResultWithSuccess);
    jest.spyOn(validationService, 'validate').mockReturnValue({
      success: true,
    });
    (verifyHmac as jest.Mock).mockReturnValue(true);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(manifestService.addSignatureToPreHooks).toHaveBeenCalledWith(
      encryptedValidManifest,
      mockManifestInput.prehookSignatures,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      validationResult: { success: true },
      hook: { pre: preHookResultWithSuccess },
    });
  });
  it('should validate manifest and pre hook result 200 and success undefined return validation result ok', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
      prehookSignatures: [faker.string.alpha(10)],
    };
    const preHookResultWithSuccess = [
      {
        response: {
          data: faker.string.alpha(),
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
        success: true,
      },
    ];
    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest
      .spyOn(manifestService, 'getDataWithUiLabels')
      .mockReturnValue(undefined);
    jest
      .spyOn(manifestService, 'addSignatureToPreHooks')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'handlePostHooks').mockResolvedValue();
    jest
      .spyOn(manifestService, 'handlePreHooks')
      .mockResolvedValue(preHookResultWithSuccess);
    jest.spyOn(validationService, 'validate').mockReturnValue({
      success: true,
    });
    (verifyHmac as jest.Mock).mockReturnValue(true);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(manifestService.addSignatureToPreHooks).toHaveBeenCalledWith(
      encryptedValidManifest,
      mockManifestInput.prehookSignatures,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      validationResult: { success: true },
      hook: { pre: preHookResultWithSuccess },
    });
  });
  it('should validate manifest and prehook failed return failed hook', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
    };
    const preHookResult = [
      {
        signature: faker.string.alpha(10),
        response: {
          data: faker.string.alpha(),
          status: 400,
          headers: { 'content-type': 'application/json' },
        },
        success: false,
      } as PreHookResponse,
    ];

    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest.spyOn(manifestService, 'getDataWithUiLabels').mockReturnValue({});
    jest.spyOn(manifestService, 'handlePostHooks').mockResolvedValue();
    jest
      .spyOn(manifestService, 'handlePreHooks')
      .mockResolvedValue(preHookResult);
    jest.spyOn(validationService, 'validate').mockReturnValue({
      success: true,
    });
    (verifyHmac as jest.Mock).mockReturnValue(true);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      validationResult: { success: true },
      hook: { pre: preHookResult },
    });
  });
  it('should handle errors with invalid manifest', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
    };

    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(false);
    jest
      .spyOn(manifestService, 'handlePostHooks')
      .mockImplementation(async () => {});
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid manifest',
    });
  });
  it('should handle errors with invalid validation', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.numeric(10),
      surname: faker.string.alpha(10),
    };

    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest.spyOn(validationService, 'validate').mockReturnValue({
      success: false,
      errors: [
        {
          path: '#/properties/surname/pattern',
          message: 'must match pattern "^[a-zA-Z\\s]+$"',
        },
      ],
    });
    (verifyHmac as jest.Mock).mockReturnValue(true);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors:
        'must match pattern "^[a-zA-Z\\s]+$" (Path: #/properties/name/pattern)',
    });
  });
  it('should handle Hash is not valid error', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
    };

    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    (verifyHmac as jest.Mock).mockReturnValue(false);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: 'Hash is not valid',
    });
  });
  it('should handle internal server error', async () => {
    const mockManifestInput = {
      url: faker.internet.url.toString(),
      name: faker.string.alpha(10),
      surname: faker.string.alpha(10),
    };

    jest
      .spyOn(manifestService, 'getManifest')
      .mockRejectedValue(new Error('Internal server error'));

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });
});
