import { Test, TestingModule } from '@nestjs/testing';
import { ManifestController } from './manifest.controller';
import { ManifestService } from './manifest.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { ManifestRequest } from './models/manifest-request.model';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
import { generateHmac, verifyHmac } from '../utils/crypto-helpers';
import {
  encryptedValidManifest,
  validManifest,
} from './fixtures/manifest-schema.fixture';
import { ValidationModule } from '../validation/validation.module';
import { ValidationService } from '../validation/validation.service';
import Ajv from 'ajv';
import { BullModule } from '@nestjs/bull';

jest.mock('../utils/crypto-helpers', () => ({
  generateHmac: jest.fn(),
  verifyHmac: jest.fn(),
}));
describe('ManifestController', () => {
  let manifestController: ManifestController;
  let manifestService: ManifestService;
  let validationService: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController],
      imports: [
        ValidationModule,
        BullModule.registerQueue(
          {
            name: 'post-hook',
          },
          {
            name: 'send-email',
          },
        ),
      ],
      providers: [
        ValidationService,
        {
          provide: HttpService,
          useValue: {},
        },
        ManifestService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() =>
              faker.string.hexadecimal({ length: 64, prefix: '' }),
            ),
          },
        },
        { provide: 'Ajv', useValue: new Ajv({ allErrors: true }) },
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
    };

    jest
      .spyOn(manifestService, 'getManifest')
      .mockResolvedValue(encryptedValidManifest);
    jest
      .spyOn(manifestService, 'decryptManifestEncFields')
      .mockReturnValue(encryptedValidManifest);
    jest.spyOn(manifestService, 'validateManifest').mockReturnValue(true);
    jest
      .spyOn(manifestService, 'handlePostHooks')
      .mockImplementation(async () => {});
    jest.spyOn(validationService, 'validate').mockReturnValue({
      success: true,
    });
    (verifyHmac as jest.Mock).mockReturnValue(true);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await manifestController.validate(mockManifestInput, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
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
          message: 'must match pattern "^[a-zA-Z]+$"',
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
        'must match pattern "^[a-zA-Z]+$" (Path: #/properties/name/pattern)',
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
