import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { WebHookRequestFixture } from '../../test/fixtures';
import { MockFactory } from 'mockingbird';
import { faker } from '@faker-js/faker';
import { HookService } from './hook.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

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
    };
    mockAxios.mockResolvedValueOnce(mockResponse);
    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    const result = await hookService.sendWebhookAsync(webHookRequest);

    expect(result).toEqual({ success: true });
  });

  it('should handle error during webhook send', async () => {
    mockAxios.mockRejectedValueOnce(new Error('ERROR'));
    const webHookRequest = MockFactory(WebHookRequestFixture).one();

    await expect(hookService.sendWebhookAsync(webHookRequest)).rejects.toThrow(
      'ERROR',
    );
  });

  it('should send emails for each recipient', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmailAsync');
    const fromEmail = faker.internet.email();
    jest.spyOn(configService, 'get').mockReturnValue(fromEmail);

    const emailRequest = {
      recipients: [
        { 'email:enc': faker.internet.email() },
        { 'email:enc': faker.internet.email() },
      ],
    };

    await hookService.sendEmailAsync(emailRequest);

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(2);

    const expectedEmail = {
      from: fromEmail,
      subject: 'Hello World',
      text: 'Hello World',
    };

    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining(expectedEmail),
    );
  });

  it('should not send email for recipients without email:enc', async () => {
    const sendEmailSpy = jest.spyOn(emailService, 'sendEmailAsync');
    const fromEmail = faker.internet.email();
    jest.spyOn(configService, 'get').mockReturnValue(fromEmail);

    const emailRequest = {
      recipients: [
        { 'email:enc': faker.internet.email() },
        { 'email:enc': null },
      ],
    };

    await hookService.sendEmailAsync(emailRequest);

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
  });
});
