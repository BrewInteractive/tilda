import { Constants, DataWithUiLabels, EmailParams } from '../../models';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from './email.processor';
import { SmtpEmailService } from '../../email/providers/smtp-email.service';
import { faker } from '@faker-js/faker';

describe('EmailProcessor', () => {
  let emailProcessor: EmailProcessor;
  let smtpEmailService: SmtpEmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SmtpEmailService,
          useValue: {
            sendEmailAsync: jest.fn(),
            setConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    emailProcessor = module.get<EmailProcessor>(EmailProcessor);
    smtpEmailService = module.get<SmtpEmailService>(SmtpEmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should send emails for each recipient', async () => {
    const sendEmailSpy = jest.spyOn(smtpEmailService, 'sendEmailAsync');
    const emailSubject = faker.lorem.words();
    jest.spyOn(configService, 'get').mockReturnValue(emailSubject);

    const emailRequest = {
      serviceType: 'SMTP',
      recipients: [
        { [Constants.emailSuffix]: faker.internet.email() },
        { [Constants.emailSuffix]: faker.internet.email() },
      ],
      config: {
        from: faker.internet.email(),
        host: faker.internet.url(),
        port: faker.number.int(),
        secure: faker.datatype.boolean(),
        auth: {
          user: faker.internet.email(),
          pass: faker.internet.password(),
        },
      },
    } as EmailParams;

    const actual = await emailProcessor.execute(emailRequest);

    expect(actual).toEqual({
      success: true,
      message: 'Email sent successfully',
    });
    expect(configService.get).toHaveBeenCalledWith('EMAIL_SUBJECT');
    expect(sendEmailSpy).toHaveBeenCalledTimes(2);

    const expectedEmail = {
      from: emailRequest.config.from,
      subject: emailSubject,
      html: '<html><body></body></html>',
    };

    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining(expectedEmail),
    );
  });

  it('should send emails for each recipient with ui labels', async () => {
    const sendEmailSpy = jest.spyOn(smtpEmailService, 'sendEmailAsync');
 
    const dataWithUi = {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
    } as DataWithUiLabels;
    const emailRequest = {
      serviceType: 'SMTP',
      subject: faker.lorem.words(),
      recipients: [
        { [Constants.emailSuffix]: faker.internet.email() },
        { [Constants.emailSuffix]: faker.internet.email() },
      ],
      config: {
        from: faker.internet.email(),
      },
      dataWithUi: dataWithUi,
    } as EmailParams;

    const actual = await emailProcessor.execute(emailRequest);

    expect(actual).toEqual({
      success: true,
      message: 'Email sent successfully',
    });
    expect(configService.get).not.toHaveBeenCalledWith('EMAIL_SUBJECT');
    expect(sendEmailSpy).toHaveBeenCalledTimes(2);

    const expectedEmail = {
      from: emailRequest.config.from,
      subject: emailRequest.subject,
      html: `<html><body><p>name: ${dataWithUi.name}</p><p>surname: ${dataWithUi.surname}</p></body></html>`,
    };
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining(expectedEmail),
    );
  });

  it('should not send email for recipients without Constants.emailSuffix', async () => {
    const sendEmailSpy = jest.spyOn(smtpEmailService, 'sendEmailAsync');
    const fromEmail = faker.internet.email();
    jest.spyOn(configService, 'get').mockReturnValue(fromEmail);

    const emailRequest = {
      serviceType: 'SMTP',
      recipients: [
        { [Constants.emailSuffix]: faker.internet.email() },
        { [Constants.emailSuffix]: null },
      ],
      config: {
        from: fromEmail,
      },
    } as EmailParams;

    const actual = await emailProcessor.execute(emailRequest);

    expect(actual).toEqual({
      success: true,
      message: 'Email sent successfully',
    });

    expect(configService.get).toHaveBeenCalledWith('EMAIL_SUBJECT');
    expect(sendEmailSpy).toHaveBeenCalledTimes(1);
  });
});
