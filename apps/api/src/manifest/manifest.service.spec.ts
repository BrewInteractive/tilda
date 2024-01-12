import { ManifestService } from './manifest.service';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { TildaManifest } from '../models';
import { Test, TestingModule } from '@nestjs/testing';
import {
  encryptedValidManifest,
  requiredFieldMissingManifest,
  requiredPostHookInvalidEmailRegex,
  requiredPostHookParamsForMissingEmail,
  requiredPreHookParamsForMissingUrl,
  validManifest,
  validManifestBase64,
} from './fixtures/manifest-schema-test';
import Ajv from 'ajv';

describe('ManifestService', () => {
  let manifestService: ManifestService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManifestService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        { provide: 'Ajv', useValue: new Ajv({ allErrors: true }) },
      ],
    }).compile();

    manifestService = module.get<ManifestService>(ManifestService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should call getManifestFromUrl when URL is provided in manifestInput', async () => {
    // Arrange
    const manifestInput = {
      url: 'http://example.com/manifest',
      base64: '',
    };

    jest
      .spyOn(manifestService, 'getManifestFromUrl')
      .mockResolvedValueOnce(validManifest as TildaManifest);

    // Act
    await manifestService.getManifest(manifestInput);

    // Assert

    expect(manifestService.getManifestFromUrl).toHaveBeenCalledWith(
      manifestInput.url,
    );
  });

  it('should call getManifestFromBase64 when base64 is provided in manifestInput', async () => {
    const manifestInput = {
      url: '',
      base64: validManifestBase64,
    };

    jest
      .spyOn(manifestService, 'getManifestFromBase64')
      .mockResolvedValueOnce(validManifest as TildaManifest);

    // Act
    await manifestService.getManifest(manifestInput);

    // Assert
    expect(manifestService.getManifestFromBase64).toHaveBeenCalledWith(
      manifestInput.base64,
    );
  });
  it('should throw error when neither url nor base64 provided', async () => {
    // Arrange
    const manifestInput = {
      url: '',
      base64: '',
    };

    // Act & Assert
    await expect(manifestService.getManifest(manifestInput)).rejects.toThrow(
      'One of url or base64 should be provided',
    );
  });

  it('should fetch manifest from URL', async () => {
    // Arrange

    const manifestUrl = 'http://example.com/manifest';
    const mockResponse = {
      status: 200,
      data: validManifest,
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of(mockResponse as AxiosResponse));

    // Act
    const result = await manifestService.getManifestFromUrl(manifestUrl);

    // Assert
    expect(result).toEqual(validManifest);
  });

  it('should throw error when fetching manifest from URL fails', async () => {
    // Arrange
    const manifestUrl = 'http://example.com/manifest';

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of({ status: 404 } as AxiosResponse));

    // Act & Assert
    await expect(
      manifestService.getManifestFromUrl(manifestUrl),
    ).rejects.toThrow(
      'Error fetching URL Error: Invalid status received (404) while fetching URL',
    );
  });

  it('should decode base64 content', async () => {
    // Act
    const result =
      await manifestService.getManifestFromBase64(validManifestBase64);

    // Assert
    expect(result).toEqual(validManifest);
  });

  it('should throw error when decoding base64 fails', async () => {
    // Arrange
    const invalidBase64Content = 'invalidBase64Content';

    // Act & Assert
    await expect(
      manifestService.getManifestFromBase64(invalidBase64Content),
    ).rejects.toThrow(
      `Error decoding base64 Unexpected token '�', \"�{ږ'AjǺ�*'���\" is not valid JSON`,
    );
  });

  describe('Validate Manifest', () => {
    test.each([
      [validManifest, true],
      [requiredFieldMissingManifest, false],
      [requiredPreHookParamsForMissingUrl, false],
      [requiredPostHookParamsForMissingEmail, false],
      [requiredPostHookInvalidEmailRegex, false],
    ])(
      'should manifest schema with input %p and output "%s"',
      (input, expectedOutput) => {
        const isValid = manifestService.validateManifest(input);
        expect(isValid).toBe(expectedOutput);
      },
    );
  });

  describe('Encryption Functions', () => {
    const secretKey =
      'd01858dd2f86ab1d3a7c4a152e6b3755a9eff744999b3a07c17fb9cbb363154e';

    it('should encrypt email recipients in manifest', () => {
      const encryptedManifest = manifestService.encryptManifestEncFields(
        validManifest,
        secretKey,
      );

      encryptedManifest.data.hooks.post.forEach((hook: any) => {
        if (hook.factory === 'email') {
          const emailParams: any = hook.params;
          emailParams.recipients.forEach((recipient: any) => {
            expect(recipient['email:enc']).not.toBe('example@mail.com');
          });
        }
      });
    });

    it('should encrypt encrypted fields in manifest', () => {
      const encryptedManifest = manifestService.encryptManifestEncFields(
        validManifest,
        secretKey,
      );

      Object.values(encryptedManifest.data.fields).forEach((field: any) => {
        if (field.const['constName2:enc']) {
          expect(field.const['constName2:enc']).not.toBe('encrypted value');
        }
        if (field.const['constName1']) {
          expect(field.const['constName1']).toBe('const value');
        }
      });
    });
  });

  describe('Decryption Functions', () => {
    const secretKey =
      'd01858dd2f86ab1d3a7c4a152e6b3755a9eff744999b3a07c17fb9cbb363154e';

    it('should decrypt email recipients in manifest', () => {
      const decryptedManifest = manifestService.decryptManifestEncFields(
        encryptedValidManifest,
        secretKey,
      );

      decryptedManifest.data.hooks.post.forEach((hook: any) => {
        if (hook.factory === 'email') {
          const emailParams: any = hook.params;
          emailParams.recipients.forEach((recipient: any) => {
            expect(recipient['email:enc']).toBe('example@mail.com');
          });
        }
      });
      Object.values(decryptedManifest.data.fields).forEach((field: any) => {
        if (field.const['constName2:enc']) {
          expect(field.const['constName2:enc']).toBe('encrypted value');
        }
        if (field.const['constName1']) {
          expect(field.const['constName1']).toBe('const value');
        }
      });
    });
  });
});
