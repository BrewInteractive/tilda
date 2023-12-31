import { ManifestService } from './manifest.service';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { TildaManifest } from '../models';
import { Test, TestingModule } from '@nestjs/testing';
import {
  requiredFieldMissingManifest,
  requiredPostHookInvalidEmailRegex,
  requiredPostHookParamsForMissingEmail,
  requiredPreHookParamsForMissingUrl,
  validManifest,
} from './fixtures/manifest-schema-test';

describe('ManifestService', () => {
  const mockManifest = {
    hmac: '',
    data: {
      fields: {
        name: {
          inputName: '',
          ui: {
            label: 'Name',
          },
          const: {
            constName1: 'const value',
          },
          validators: [
            {
              factory: 'numeric',
            },
          ],
        },
        surname: {
          inputName: '',
          ui: {
            label: 'Surname',
          },
          const: {
            'constName2:enc': 'encrypted value',
          },
          validators: [
            {
              factory: 'numeric',
            },
          ],
        },
      },
      hooks: {
        pre: [
          {
            factory: 'webhook',
            params: {
              url: 'test.example.com',
              headers: [],
              method: 'post',
              values: {
                nameSurname: '{$.fields.name.value} {$.fields.surname.value}',
              },
            },
          },
        ],
        post: [
          {
            factory: 'email',
            params: {
              recipients: [
                {
                  'email:enc': 'encrypted email address',
                },
              ],
            },
          },
        ],
      },
    },
  } as TildaManifest;
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
      .mockResolvedValueOnce(mockManifest as TildaManifest);

    // Act
    await manifestService.getManifest(manifestInput);

    // Assert

    expect(manifestService.getManifestFromUrl).toHaveBeenCalledWith(
      manifestInput.url,
    );
  });

  it('should call getManifestFromBase64 when base64 is provided in manifestInput', async () => {
    // Arrange
    const base64Content =
      'ewogICAgImhtYWMiOiAiIiwKICAgICJkYXRhIjogewogICAgICAgICJmaWVsZHMiOiB7CiAgICAgICAgICAgICJuYW1lIjogewogICAgICAgICAgICAgICAgImlucHV0TmFtZSI6ICIiLAogICAgICAgICAgICAgICAgInVpIjogewogICAgICAgICAgICAgICAgICAgICJsYWJlbCI6ICJOYW1lIgogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICJjb25zdCI6IHsKICAgICAgICAgICAgICAgICAgICAiY29uc3ROYW1lMSI6ICJjb25zdCB2YWx1ZSIKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAidmFsaWRhdG9ycyI6IFsKICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICJmYWN0b3J5IjogIm51bWVyaWMiCiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgXQogICAgICAgICAgICB9LAogICAgICAgICAgICAic3VybmFtZSI6IHsKICAgICAgICAgICAgICAgICJpbnB1dE5hbWUiOiAiIiwKICAgICAgICAgICAgICAgICJ1aSI6IHsKICAgICAgICAgICAgICAgICAgICAibGFiZWwiOiAiU3VybmFtZSIKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAiY29uc3QiOiB7CiAgICAgICAgICAgICAgICAgICAgImNvbnN0TmFtZTI6ZW5jIjogImVuY3J5cHRlZCB2YWx1ZSIKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAidmFsaWRhdG9ycyI6IFsKICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICJmYWN0b3J5IjogIm51bWVyaWMiCiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgXQogICAgICAgICAgICB9CiAgICAgICAgfSwKICAgICAgICAiaG9va3MiOiB7CiAgICAgICAgICAgICJwcmUiOiBbCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgImZhY3RvcnkiOiAid2ViaG9vayIsCiAgICAgICAgICAgICAgICAgICAgInBhcmFtcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgInVybCI6ICIiLAogICAgICAgICAgICAgICAgICAgICAgICAiaGVhZGVycyI6IFtdLAogICAgICAgICAgICAgICAgICAgICAgICAibWV0aG9kIjogInBvc3QiLAogICAgICAgICAgICAgICAgICAgICAgICAidmFsdWVzIjogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgIm5hbWVTdXJuYW1lIjogInskLmZpZWxkcy5uYW1lLnZhbHVlfSB7JC5maWVsZHMuc3VybmFtZS52YWx1ZX0iCiAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIF0sCiAgICAgICAgICAgICJwb3N0IjogWwogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICJmYWN0b3J5IjogImVtYWlsIiwKICAgICAgICAgICAgICAgICAgICAicGFyYW1zIjogewogICAgICAgICAgICAgICAgICAgICAgICAicmVjaXBpZW50cyI6IFsKICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAiZW1haWw6ZW5jIjogImVuY3J5cHRlZCBlbWFpbCBhZGRyZXNzIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICBdCiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICBdCiAgICAgICAgfQogICAgfQp9';
    const manifestInput = {
      url: '',
      base64: base64Content,
    };

    jest
      .spyOn(manifestService, 'getManifestFromBase64')
      .mockResolvedValueOnce(mockManifest as TildaManifest);

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
      data: mockManifest,
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of(mockResponse as AxiosResponse));

    // Act
    const result = await manifestService.getManifestFromUrl(manifestUrl);

    // Assert
    expect(result).toEqual(mockManifest);
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
    // Arrange
    const base64Content =
      'ewogICAgImhtYWMiOiAiIiwKICAgICJkYXRhIjogewogICAgICAgICJmaWVsZHMiOiB7CiAgICAgICAgICAgICJuYW1lIjogewogICAgICAgICAgICAgICAgImlucHV0TmFtZSI6ICIiLAogICAgICAgICAgICAgICAgInVpIjogewogICAgICAgICAgICAgICAgICAgICJsYWJlbCI6ICJOYW1lIgogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICJjb25zdCI6IHsKICAgICAgICAgICAgICAgICAgICAiY29uc3ROYW1lMSI6ICJjb25zdCB2YWx1ZSIKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAidmFsaWRhdG9ycyI6IFsKICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICJmYWN0b3J5IjogIm51bWVyaWMiCiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgXQogICAgICAgICAgICB9LAogICAgICAgICAgICAic3VybmFtZSI6IHsKICAgICAgICAgICAgICAgICJpbnB1dE5hbWUiOiAiIiwKICAgICAgICAgICAgICAgICJ1aSI6IHsKICAgICAgICAgICAgICAgICAgICAibGFiZWwiOiAiU3VybmFtZSIKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAiY29uc3QiOiB7CiAgICAgICAgICAgICAgICAgICAgImNvbnN0TmFtZTI6ZW5jIjogImVuY3J5cHRlZCB2YWx1ZSIKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAidmFsaWRhdG9ycyI6IFsKICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICJmYWN0b3J5IjogIm51bWVyaWMiCiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgXQogICAgICAgICAgICB9CiAgICAgICAgfSwKICAgICAgICAiaG9va3MiOiB7CiAgICAgICAgICAgICJwcmUiOiBbCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgImZhY3RvcnkiOiAid2ViaG9vayIsCiAgICAgICAgICAgICAgICAgICAgInBhcmFtcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgInVybCI6ICJ0ZXN0LmV4YW1wbGUuY29tIiwKICAgICAgICAgICAgICAgICAgICAgICAgImhlYWRlcnMiOiBbXSwKICAgICAgICAgICAgICAgICAgICAgICAgIm1ldGhvZCI6ICJwb3N0IiwKICAgICAgICAgICAgICAgICAgICAgICAgInZhbHVlcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICJuYW1lU3VybmFtZSI6ICJ7JC5maWVsZHMubmFtZS52YWx1ZX0geyQuZmllbGRzLnN1cm5hbWUudmFsdWV9IgogICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgfQogICAgICAgICAgICBdLAogICAgICAgICAgICAicG9zdCI6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAiZmFjdG9yeSI6ICJlbWFpbCIsCiAgICAgICAgICAgICAgICAgICAgInBhcmFtcyI6IHsKICAgICAgICAgICAgICAgICAgICAgICAgInJlY2lwaWVudHMiOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImVtYWlsOmVuYyI6ICJlbmNyeXB0ZWQgZW1haWwgYWRkcmVzcyIKICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgXQogICAgICAgIH0KICAgIH0KfQ==';

    // Act
    const result = await manifestService.getManifestFromBase64(base64Content);

    // Assert
    expect(result).toEqual(mockManifest);
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

  describe('Encryption Functions', () => {
    const secretKey =
      'd01858dd2f86ab1d3a7c4a152e6b3755a9eff744999b3a07c17fb9cbb363154e';

    it('should encrypt email recipients in manifest', () => {
      const encryptedManifest = manifestService.encryptManifestEncFields(
        mockManifest,
        secretKey,
      );

      encryptedManifest.data.hooks.post.forEach((hook: any) => {
        if (hook.factory === 'email') {
          const emailParams: any = hook.params;
          emailParams.recipients.forEach((recipient: any) => {
            expect(recipient['email:enc']).not.toBe('encrypted email address');
          });
        }
      });
    });

    it('should encrypt encrypted fields in manifest', () => {
      const encryptedManifest = manifestService.encryptManifestEncFields(
        mockManifest,
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
});
