import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosError, AxiosHeaders } from 'axios';

import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { HookService } from './hook.service';
import { MockFactory } from 'mockingbird';
import { WebHookRequestFixture } from '../../test/fixtures';
import { faker } from '@faker-js/faker';
import { Constants } from '../models';

jest.mock('axios');
const mockAxios = axios as jest.MockedFunction<typeof axios>;

describe('HookService', () => {
  let hookService: HookService;
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HookService,
        {
          provide: 'EmailService',
          useValue: {
            sendEmailAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    hookService = module.get<HookService>(HookService);
    emailService = module.get<EmailService>('EmailService');
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should send webhook successfully', async () => {
    const mockResponse = {
      data: faker.string.alpha(),
      status: 200,
      headers: ['content-type: application/json'],
    };
    mockAxios.mockResolvedValueOnce(mockResponse);
    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    const result = await hookService.sendWebhookAsync(webHookRequest);

    expect(result).toEqual({ response: mockResponse });
  });

  it('should handle error during webhook send', async () => {
    mockAxios.mockRejectedValueOnce(new Error('ERROR'));
    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    await expect(hookService.sendWebhookAsync(webHookRequest)).rejects.toThrow(
      'ERROR',
    );
  });

  it('should handle error during webhook send', async () => {
    const headers = new AxiosHeaders();

    const errorMock: AxiosError = new AxiosError('Axios error') as AxiosError;
    errorMock.name = 'AxiosError';
    errorMock.code = '500';
    errorMock.request = {};
    errorMock.response = {
      status: 500,
      statusText: 'Axios error',
      headers: { 'content-type': 'application/json' },
      config: { headers: headers },
      data: { errors: [{ detail: 'Internal Server Error' }] },
    };
    errorMock.isAxiosError = true;
    errorMock.toJSON = jest.fn();
    mockAxios.mockRejectedValueOnce(errorMock);

    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    try {
      await hookService.sendWebhookAsync(webHookRequest);
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(500);
      expect(error.response.headers).toEqual({
        'content-type': 'application/json',
      });
      expect(error.response.data).toEqual({
        errors: [{ detail: 'Internal Server Error' }],
      });
      expect(console.error).toHaveBeenCalledWith(
        'Error Message:',
        'Axios error',
      );
    }
  });
  it('should send emails for each recipient', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmailAsync');
    const fromEmail = faker.internet.email();
    jest.spyOn(configService, 'get').mockReturnValue(fromEmail);

    const emailRequest = {
      recipients: [
        { [Constants.emailSuffix]: faker.internet.email() },
        { [Constants.emailSuffix]: faker.internet.email() },
      ],
    };

    await hookService.sendEmailAsync(emailRequest);

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(2);

    const expectedEmail = {
      from: fromEmail,
      subject: 'Tilda Run For Validation Result',
      html: '<html><body></body></html>',
    };

    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining(expectedEmail),
    );
  });

  it('should send emails for each recipient with ui labels', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmailAsync');
    const fromEmail = faker.internet.email();
    jest.spyOn(configService, 'get').mockReturnValue(fromEmail);

    const dataWithUi = {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
    };
    const emailRequest = {
      recipients: [
        { [Constants.emailSuffix]: faker.internet.email() },
        { [Constants.emailSuffix]: faker.internet.email() },
      ],
      dataWithUi: dataWithUi,
    };
    await hookService.sendEmailAsync(emailRequest);

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(2);

    const expectedEmail = {
      from: fromEmail,
      subject: 'Tilda Run For Validation Result',
      html: `<html><body><p>name: ${dataWithUi.name}</p><p>surname: ${dataWithUi.surname}</p></body></html>`,
    };
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining(expectedEmail),
    );
  });

  it('should not send email for recipients without Constants.emailSuffix', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmailAsync');
    const fromEmail = faker.internet.email();
    jest.spyOn(configService, 'get').mockReturnValue(fromEmail);

    const emailRequest = {
      recipients: [
        { [Constants.emailSuffix]: faker.internet.email() },
        { [Constants.emailSuffix]: null },
      ],
    };

    await hookService.sendEmailAsync(emailRequest);

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
  });
});
