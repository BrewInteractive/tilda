import { BullModule, getQueueToken } from '@nestjs/bull';
import {
  Constants,
  EmailParams,
  Hook,
  HookType,
  TildaManifest,
  WebhookParams,
} from '../models';
import { EmailHookFixture, WebHookFixture } from '../../test/fixtures';
import { WebHookResponse } from '../hook/models';
import { Test, TestingModule } from '@nestjs/testing';
import { decrypt, generateHmac, verifyHmac } from '../utils/crypto-helpers';

import Ajv from 'ajv';
import { AxiosResponse } from 'axios';
import { EmailProcessor } from '../hook/processors/email.processor';
import { HookProcessorFactory } from './../hook/hook.factory';
import { HttpService } from '@nestjs/axios';
import { ManifestService } from './manifest.service';
import { MockFactory } from 'mockingbird';
import { TildaManifestFixture } from '../../test/fixtures/manifest/tilda-manifest.fixture';
import { WebhookProcessor } from '../hook/processors/webhook.processor';
import { faker } from '@faker-js/faker';
import { of } from 'rxjs';

jest.mock('../hook/hook.factory');
jest.mock('../utils/crypto-helpers', () => ({
  generateHmac: jest.fn(),
  verifyHmac: jest.fn(),
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));
describe('ManifestService', () => {
  const secretKey =
    'd01858dd2f86ab1d3a7c4a152e6b3755a9eff744999b3a07c17fb9cbb363154e';
  let manifestService: ManifestService;
  let httpService: HttpService;
  let hookProcessorFactory: HookProcessorFactory;
  let webHookProcessor: WebhookProcessor;
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
        {
          provide: HookProcessorFactory,
          useValue: {
            getProcessor: jest.fn(),
          },
        },
        {
          provide: WebhookProcessor,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EmailProcessor,
          useValue: {
            execute: jest.fn(),
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
    hookProcessorFactory =
      module.get<HookProcessorFactory>(HookProcessorFactory);
    webHookProcessor = module.get<WebhookProcessor>(WebhookProcessor);
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

  it('should return manifest when Manifest is provided in manifestInput', async () => {
    const mockTildaManifest = MockFactory(
      TildaManifestFixture,
    ).one() as TildaManifest;

    // Arrange
    const manifestInput = {
      manifest: mockTildaManifest,
    };

    // Act
    const actual = await manifestService.getManifest(manifestInput);

    // Assert
    expect(actual).toEqual(mockTildaManifest);
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

  it('should add both post hooks to their respective queues', async () => {
    const webHookFixture = MockFactory(WebHookFixture).one();
    const emailHookFixture = MockFactory(EmailHookFixture).one();
    const hooks: Hook[] = [{ ...webHookFixture }, { ...emailHookFixture }];
    await manifestService.handlePostHooks(hooks);

    expect(queueMock.add).toHaveBeenCalledWith({
      hook: hooks[0],
      dataWithUi: undefined,
    });
    expect(queueMock.add).toHaveBeenCalledWith({
      hook: hooks[1],
      dataWithUi: undefined,
    });
  });
  it('should add email post hooks to their respective queues with ui labels', async () => {
    const emailHookFixture = MockFactory(EmailHookFixture).one();
    const dataWithUi = {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
    };
    (emailHookFixture.params as EmailParams).dataWithUi = dataWithUi;
    const hooks: Hook[] = [{ ...emailHookFixture }];
    await manifestService.handlePostHooks(hooks);

    expect(queueMock.add).toHaveBeenCalledWith({
      hook: hooks[0],
    });
  });
  it('should send webhook successfully', async () => {
    const webHookFixture = MockFactory(WebHookFixture).one();
    const hooks: Hook[] = [{ ...webHookFixture }];
    const mockHmacValue = faker.string.alpha(10);

    const mockResponse = {
      response: {
        status: 200,
        headers: {},
        data: {},
      },
      success: true,
    } as WebHookResponse;

    jest
      .spyOn(hookProcessorFactory, 'getProcessor')
      .mockReturnValueOnce(webHookProcessor);

    jest.spyOn(webHookProcessor, 'execute').mockResolvedValue(mockResponse);

    (generateHmac as jest.Mock).mockImplementation(() => mockHmacValue);

    const result = await manifestService.handlePreHooks(hooks, secretKey);

    expect(result).toEqual([
      { signature: mockHmacValue, ignoreSuccess: false, ...mockResponse },
    ]);
    expect(hookProcessorFactory.getProcessor).toHaveBeenCalledWith(
      hooks[0].factory,
    );
    expect(webHookProcessor.execute).toHaveBeenCalledWith(hooks[0].params);
  });
  it('should not send webhook with signatures', async () => {
    const webHookFixture = MockFactory(WebHookFixture).one();
    const hooks: Hook[] = [{ ...webHookFixture }];
    const mockHmacValue = faker.string.alpha(10);

    hooks[0].signature = mockHmacValue;

    const mockResponse = {
      ...hooks[0],
      signature: mockHmacValue,
      message:
        'The pre-hook request was not sent because the signatures are the same',
      success: false,
    };

    const mockExecute = jest.fn();
    //(HookFactory.getHook as jest.Mock).mockReturnValue({
    //  execute: mockExecute,
    //});
    mockExecute.mockResolvedValue(mockResponse);
    (generateHmac as jest.Mock).mockImplementation(() => mockHmacValue);
    (verifyHmac as jest.Mock).mockImplementation(() => true);

    const result = await manifestService.handlePreHooks(hooks, secretKey);

    expect(result).toEqual([mockResponse]);
    //expect(HookFactory.getHook).not.toHaveBeenCalledWith('webhook', {
    //  sendWebhookAsync: hookServiceMock.sendWebhookAsync,
    //  sendEmailAsync: hookServiceMock.sendEmailAsync,
    //});
    expect(mockExecute).not.toHaveBeenCalledWith(hooks[0].params);
  });
  it('should add signatures for manifest', async () => {
    const mockTildaManifest = MockFactory(TildaManifestFixture).one();
    const signatures = [faker.string.alpha(10)];
    const manifestWithPreSignatures = mockTildaManifest;
    manifestWithPreSignatures.data.hooks.pre[0].signature = signatures[0];
    // Act
    const result = await manifestService.addSignatureToPreHooks(
      mockTildaManifest,
      signatures,
    );

    // Assert
    expect(result).toEqual(manifestWithPreSignatures);
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
    ).recipients[0][Constants.emailSuffix] = 'examplemail.com';

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
      Constants.emailSuffix
    ] = TildaManifestFixture.getFirstRecipientEmail();
    validManifest.data.fields['name'].const['constName1'] =
      TildaManifestFixture.getConstName1Value();
    validManifest.data.fields['surname'].const[
      'constName2' + Constants.encryptSuffix
    ] = TildaManifestFixture.getConstName2Value();

    it('should encrypt email recipients in manifest', () => {
      const encryptedManifest = manifestService.encryptManifestEncFields(
        validManifest,
        secretKey,
      );

      encryptedManifest.data.hooks.post.forEach((hook: any) => {
        if (hook.factory === HookType.email) {
          const emailParams: any = hook.params;
          emailParams.recipients.forEach((recipient: any) => {
            expect(recipient[Constants.emailSuffix]).not.toBe(
              'example@mail.com',
            );
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
        if (field.const['constName2' + Constants.encryptSuffix]) {
          expect(field.const['constName2' + Constants.encryptSuffix]).not.toBe(
            TildaManifestFixture.getConstName2Value(),
          );
        }
        if (field.const['constName1']) {
          expect(field.const['constName1']).toBe(
            TildaManifestFixture.getConstName1Value(),
          );
        }
      });
    });
  });

  describe('Decryption Functions', () => {
    const encryptedValidManifest = MockFactory(TildaManifestFixture).one();
    encryptedValidManifest.hmac =
      TildaManifestFixture.getEncryptedValidManifestHMAC();
    (
      encryptedValidManifest.data.hooks.post[0].params as EmailParams
    ).recipients[0][Constants.emailSuffix] =
      TildaManifestFixture.getFirstRecipientEncryptedEmail();
    encryptedValidManifest.data.fields['name'].const['constName1'] =
      TildaManifestFixture.getConstName1Value();
    encryptedValidManifest.data.fields['surname'].const[
      'constName2' + Constants.encryptSuffix
    ] = TildaManifestFixture.getConstName2EncValue();

    it('should decrypt email recipients in manifest', () => {
      (decrypt as jest.Mock)
        .mockImplementationOnce(() =>
          TildaManifestFixture.getFirstRecipientEmail(),
        )
        .mockImplementation(() => TildaManifestFixture.getConstName2Value());

      const decryptedManifest = manifestService.decryptManifestEncFields(
        encryptedValidManifest,
        secretKey,
      );

      decryptedManifest.data.hooks.post.forEach((hook: any) => {
        if (hook.factory === HookType.email) {
          const emailParams: any = hook.params;
          emailParams.recipients.forEach((recipient: any) => {
            expect(recipient[Constants.emailSuffix]).toBe(
              TildaManifestFixture.getFirstRecipientEmail(),
            );
          });
        }
      });
      Object.values(decryptedManifest.data.fields).forEach((field: any) => {
        if (field.const['constName2' + Constants.encryptSuffix]) {
          expect(field.const['constName2' + Constants.encryptSuffix]).toBe(
            TildaManifestFixture.getConstName2Value(),
          );
        }
        if (field.const['constName1']) {
          expect(field.const['constName1']).toBe(
            TildaManifestFixture.getConstName1Value(),
          );
        }
      });
    });
  });
  describe('Set Webhook Params Functions', () => {
    const validManifest = MockFactory(TildaManifestFixture).one();
    validManifest.data.fields['name'].inputName =
      TildaManifestFixture.setInputNameForName();
    validManifest.data.fields['name'].const['constName1'] =
      TildaManifestFixture.getConstName1Value();
    validManifest.data.fields['surname'].const[
      'constName2' + Constants.encryptSuffix
    ] = TildaManifestFixture.getConstName2Value();
    (validManifest.data.hooks.pre[0].params as WebhookParams).values =
      TildaManifestFixture.getWebhookValues();

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
        'testName.const.constName1': TildaManifestFixture.getConstName1Value(),
        'name.const.constName1': TildaManifestFixture.getConstName1Value(),
        ['surname.const.constName2' + Constants.encryptSuffix]:
          TildaManifestFixture.getConstName2Value(),
      };

      const transformedPatternValues = {
        nameSurname: `${name} ${surname}`,
        nameConstValue: TildaManifestFixture.getConstName1Value(),
        surnameConstEncValue: TildaManifestFixture.getConstName2Value(),
      };

      const expectedValues = {
        nameSurname: `${name} ${surname}`,
        nameConstValue: TildaManifestFixture.getConstName1Value(),
        surnameConstEncValue: TildaManifestFixture.getConstName2Value(),
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
        'testName.const.constName1': TildaManifestFixture.getConstName1Value(),
        'name.const.constName1': TildaManifestFixture.getConstName1Value(),
        ['surname.const.constName2' + Constants.encryptSuffix]:
          TildaManifestFixture.getConstName2Value(),
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
        'testName.const.constName1': TildaManifestFixture.getConstName1Value(),
        'name.const.constName1': TildaManifestFixture.getConstName1Value(),
        ['surname.const.constName2' + Constants.encryptSuffix]:
          TildaManifestFixture.getConstName2Value(),
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
        'testName.const.constName1': TildaManifestFixture.getConstName1Value(),
        'name.const.constName1': TildaManifestFixture.getConstName1Value(),
      };

      const expectedValues = {
        nameSurname: 'Name: ' + name + ' Surname: ' + surname,
        nameConstValue: TildaManifestFixture.getConstName1Value(),
        surnameConstEncValue: '',
      };

      const transformedPatternValues = manifestService.transformPatternValues(
        (manifest.data.hooks.pre[0].params as WebhookParams).values,
        webhookKeyValues,
      );

      expect(transformedPatternValues).toEqual(expectedValues);
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
        [manifest.data.fields['surname'].ui.label]: surname,
        [manifest.data.fields['name'].ui.label]: name,
      };

      const generatedKeyValues = manifestService.getDataWithUiLabels(
        manifest as TildaManifest,
        payload,
      );

      expect(generatedKeyValues).toEqual(expectedOutput);
    });
  });
});
