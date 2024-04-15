import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@nestjs/config';
import { Constants } from '../../models';
import { EmailProcessor } from './email.processor';
import { EmailService } from '../../email/email.service';
import { faker } from '@faker-js/faker';

describe('EmailProcessor', () => {
  let emailProcessor: EmailProcessor;
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
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

    emailProcessor = module.get<EmailProcessor>(EmailProcessor);
    emailService = module.get<EmailService>('EmailService');
    configService = module.get<ConfigService>(ConfigService);
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

    const actual = await emailProcessor.execute(emailRequest);

    expect(actual).toEqual({
      success: true,
      message: 'Email sent successfully',
    });
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

    const actual = await emailProcessor.execute(emailRequest);

    expect(actual).toEqual({
      success: true,
      message: 'Email sent successfully',
    });
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

    const actual = await emailProcessor.execute(emailRequest);

    expect(actual).toEqual({
      success: true,
      message: 'Email sent successfully',
    });

    expect(configService.get).toHaveBeenCalledWith('SMTP.AUTH.USER');
    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
  });
});
