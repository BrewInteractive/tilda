import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

describe('QueueService', () => {
  let queueService: QueueService;
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
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

    queueService = module.get<QueueService>(QueueService);
    emailService = module.get<EmailService>('EmailService');
    configService = module.get<ConfigService>(ConfigService);
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

    await queueService.sendEmailAsync(emailRequest);

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

    await queueService.sendEmailAsync(emailRequest);

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
  });
});
