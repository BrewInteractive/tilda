import { ManifestService } from './manifest.service';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { EmailParams, Hook, TildaManifest, WebhookParams } from '../models';
import { Test, TestingModule } from '@nestjs/testing';
import Ajv from 'ajv';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { MockFactory } from 'mockingbird';
import { EmailHookFixture, WebHookFixture } from '../../test/fixtures';
import { faker } from '@faker-js/faker';
import { TildaManifestFixture } from '../../test/fixtures/manifest/tilda-manifest.fixture';

describe('ManifestService', () => {
  let manifestService: ManifestService;
  let httpService: HttpService;
  const queueMock = { add: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'hook-queue',
        }),
      ],
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
    })
      .overrideProvider(getQueueToken('hook-queue'))
      .useValue(queueMock)
      .compile();

    manifestService = module.get<ManifestService>(ManifestService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should call getManifestFromUrl when URL is provided in manifestInput', async () => {
    const mockTildaManifest = MockFactory(
      TildaManifestFixture,
    ).one() as TildaManifest;

    // Arrange
    const manifestInput = {
      url: 'http://example.com/manifest',
      base64: '',
    };

    jest
      .spyOn(manifestService, 'getManifestFromUrl')
      .mockResolvedValueOnce(mockTildaManifest as TildaManifest);

    // Act
    await manifestService.getManifest(manifestInput);

    // Assert

    expect(manifestService.getManifestFromUrl).toHaveBeenCalledWith(
      manifestInput.url,
    );
  });

  it('should call getManifestFromBase64 when base64 is provided in manifestInput', async () => {
    const mockTildaManifest = MockFactory(
      TildaManifestFixture,
    ).one() as TildaManifest;

    const manifestInput = {
      url: '',
      base64: 'validManifestBase64',
    };

    jest
      .spyOn(manifestService, 'getManifestFromBase64')
      .mockResolvedValueOnce(mockTildaManifest as TildaManifest);

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
    const mockTildaManifest = MockFactory(TildaManifestFixture).one();
    // Arrange

    const manifestUrl = 'http://example.com/manifest';
    const mockResponse = {
      status: 200,
      data: mockTildaManifest,
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of(mockResponse as AxiosResponse));

    // Act
    const result = await manifestService.getManifestFromUrl(manifestUrl);

    // Assert
    expect(result).toEqual(mockTildaManifest);
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
    const mockTildaManifest = MockFactory(TildaManifestFixture).one();
    const base64String = btoa(JSON.stringify(mockTildaManifest));

    // Act
    const result = await manifestService.getManifestFromBase64(base64String);

    // Assert
    expect(result).toEqual(mockTildaManifest);
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

  it('should add both hooks to their respective queues', async () => {
    const webHookFixture = MockFactory(WebHookFixture).one();
    const emailHookFixture = MockFactory(EmailHookFixture).one();
    const hooks: Hook[] = [{ ...webHookFixture }, { ...emailHookFixture }];

    await manifestService.handleQueueHooks(hooks);

    expect(queueMock.add).toHaveBeenCalledWith(hooks[0]);
    expect(queueMock.add).toHaveBeenCalledWith(hooks[1]);
  });

  describe('Validate Manifest', () => {
    const validManifest = MockFactory(TildaManifestFixture).one();
    const requiredFieldMissingManifest =
      MockFactory(TildaManifestFixture).one();
    requiredFieldMissingManifest.data.fields = {};

    const requiredPreHookParamsForMissingUrl =
      MockFactory(TildaManifestFixture).one();
    (
      requiredPreHookParamsForMissingUrl.data.hooks.pre[0]
        .params as WebhookParams
    ).url = '';

    const requiredPostHookParamsForMissingEmail =
      MockFactory(TildaManifestFixture).one();
    (
      requiredPostHookParamsForMissingEmail.data.hooks.post[0]
        .params as EmailParams
    ).recipients = null;

    const requiredPostHookInvalidEmailRegex =
      MockFactory(TildaManifestFixture).one();
    (
      requiredPostHookInvalidEmailRegex.data.hooks.post[0].params as EmailParams
    ).recipients[0]['email:enc'] = 'examplemail.com';

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
    const validManifest = MockFactory(TildaManifestFixture).one();
    (validManifest.data.hooks.post[0].params as EmailParams).recipients[0][
      'email:enc'
    ] = 'example@mail.com';
    validManifest.data.fields['name'].const['constName1'] = 'const value';
    validManifest.data.fields['surname'].const['constName2:enc'] =
      'encrypted value';
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
    const encryptedValidManifest = MockFactory(TildaManifestFixture).one();
    encryptedValidManifest.hmac =
      '44a98ec59c22d24b6b6a612b4acd90f68180237412e4c3e01dd1f913542dc9c4';
    (
      encryptedValidManifest.data.hooks.post[0].params as EmailParams
    ).recipients[0]['email:enc'] =
      '24b5b244948a45caa4415a15:9283a0fdfbbb6e3a804fe5ebb938bfcf:872cc965688f2299bc67cd67105423c1';
    encryptedValidManifest.data.fields['name'].const['constName1'] =
      'const value';
    encryptedValidManifest.data.fields['surname'].const['constName2:enc'] =
      'd2f9641add34ca1f65f20d38:efb52d71d555b6183b4eeaa8d21341:683dd0ae0f63f87f0a54d05d1563d5a7';
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
  describe('Set Webhook Params Functions', () => {
    const validManifest = MockFactory(TildaManifestFixture).one();
    validManifest.data.fields['name'].inputName = 'testName';
    validManifest.data.fields['name'].const['constName1'] = 'const value';
    validManifest.data.fields['surname'].const['constName2:enc'] =
      'encrypted value';
    (validManifest.data.hooks.pre[0].params as WebhookParams).values = {
      nameSurname: '{$.fields.name.value} {$.fields.surname.value}',
      nameConstValue: '{$.fields.name.const.constName1.value}',
      surnameConstEncValue: '{$.fields.surname.const.constName2.value}',
    };

    it('should set webhook params values the correct output', () => {
      const manifest = JSON.parse(
        JSON.stringify(validManifest),
      ) as TildaManifest;
      const name = faker.person.firstName();
      const surname = faker.person.lastName();
      const payload = {
        surname,
        testName: name,
      };

      const generatedKeyValues = {
        surname,
        testName: name,
        name: name,
        'testName.const.constName1': 'const value',
        'name.const.constName1': 'const value',
        'surname.const.constName2:enc': 'encrypted value',
      };

      const transformedPatternValues = {
        nameSurname: `${name} ${surname}`,
        nameConstValue: 'const value',
        surnameConstEncValue: 'encrypted value',
      };

      const expectedValues = {
        nameSurname: `${name} ${surname}`,
        nameConstValue: 'const value',
        surnameConstEncValue: 'encrypted value',
      };

      jest
        .spyOn(manifestService, 'generateWebhookKeyValues')
        .mockReturnValue(generatedKeyValues);

      jest
        .spyOn(manifestService, 'transformPatternValues')
        .mockReturnValue(transformedPatternValues);

      manifestService.setWebhookParamsValues(
        manifest as TildaManifest,
        payload,
      );

      expect(
        (manifest.data.hooks.pre[0].params as WebhookParams).values,
      ).toEqual(expectedValues);
    });
    it('should generate the correct all key values with inputName', () => {
      const manifest = JSON.parse(
        JSON.stringify(validManifest),
      ) as TildaManifest;
      const name = faker.person.firstName();
      const surname = faker.person.lastName();
      const payload = {
        surname,
        testName: name,
      };

      const expectedOutput = {
        surname,
        testName: name,
        name,
        'testName.const.constName1': 'const value',
        'name.const.constName1': 'const value',
        'surname.const.constName2:enc': 'encrypted value',
      };

      const generatedKeyValues = manifestService.generateWebhookKeyValues(
        manifest as TildaManifest,
        payload,
      );

      expect(generatedKeyValues).toEqual(expectedOutput);
    });
    it('should generate the correct all key values with fieldName', () => {
      const manifest = JSON.parse(
        JSON.stringify(validManifest),
      ) as TildaManifest;
      const name = faker.person.firstName();
      const surname = faker.person.lastName();
      const payload = {
        surname,
        name,
      };

      const expectedOutput = {
        surname,
        testName: name,
        name,
        'testName.const.constName1': 'const value',
        'name.const.constName1': 'const value',
        'surname.const.constName2:enc': 'encrypted value',
      };

      const generatedKeyValues = manifestService.generateWebhookKeyValues(
        manifest as TildaManifest,
        payload,
      );

      expect(generatedKeyValues).toEqual(expectedOutput);
    });
    it('should tranform the correct all webhook', () => {
      const manifest = JSON.parse(
        JSON.stringify(validManifest),
      ) as TildaManifest;
      const name = faker.person.firstName();
      const surname = faker.person.lastName();

      const webhookKeyValues = {
        surname,
        testName: name,
        name,
        'testName.const.constName1': 'const value',
        'name.const.constName1': 'const value',
      };

      const expectedValues = {
        nameSurname: name + ' ' + surname,
        nameConstValue: 'const value',
        surnameConstEncValue: '',
      };

      const transformedPatternValues = manifestService.transformPatternValues(
        (manifest.data.hooks.pre[0].params as WebhookParams).values,
        webhookKeyValues,
      );

      expect(transformedPatternValues).toEqual(expectedValues);
    });
  });
});
