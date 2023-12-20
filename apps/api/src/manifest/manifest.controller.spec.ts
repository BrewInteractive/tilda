import { Test, TestingModule } from '@nestjs/testing';
import { ManifestController } from './manifest.controller';
import { ManifestService } from './manifest.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { ManifestRequest } from './models/manifest-request.model';
import { HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
import { generateHmac } from '../utils/crypto-helpers';
import { validManifest } from './fixtures/manifest-schema-test';

jest.mock('../utils/crypto-helpers', () => ({
  generateHmac: jest.fn(),
}));
describe('ManifestController', () => {
  let manifestController: ManifestController;
  let manifestService: ManifestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController],
      providers: [
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
      ],
    }).compile();

    manifestController = module.get<ManifestController>(ManifestController);
    manifestService = module.get<ManifestService>(ManifestService);
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
});
