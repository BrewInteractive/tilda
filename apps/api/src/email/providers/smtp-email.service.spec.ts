import { SmtpEmailService } from './smtp-email.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SmtpEmailConfig } from './smtp-email.config';
import { EmailFixture } from '../../../test/fixtures/email/email.fixture';
import { MockFactory } from 'mockingbird';
import * as nodemailer from 'nodemailer';
import { faker } from '@faker-js/faker';
import { Constants } from '../../models';

jest.mock('nodemailer');
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

describe('SmtpEmailService', () => {
  let emailService: SmtpEmailService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmtpEmailService,
      ],
    }).compile();

    emailService = module.get<SmtpEmailService>(SmtpEmailService);
  });

  it('should send an email successfully', async () => {
    const config = {
      host: faker.internet.url(),
      port: faker.number.int(),
      secure: faker.datatype.boolean(),
      user: faker.internet.email(),
      pass: faker.internet.password(),
    } as SmtpEmailConfig;
    // Arrange
    const email = MockFactory(EmailFixture).one();

    // Act
    emailService.setConfig(config);
    await emailService.sendEmailAsync(email);

    // Assert
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({ ...email });
  });
  it('should configure transporter with auth', () => {
    const authLoginConfig: SmtpEmailConfig = {
      from: faker.internet.email(),
      host: faker.internet.url(),
      port: 587,
      secure: false,
      user: faker.internet.email(),
      pass: faker.internet.password(),
    };

    const mockCreateTransport = nodemailer.createTransport as jest.Mock;
    emailService.setConfig(authLoginConfig);

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: authLoginConfig.host,
      port: 587,
      secure: false,
      auth: {
        user: authLoginConfig.user,
        pass: authLoginConfig.pass,
      },
    });
  });
  it('should configure transporter with encrypted auth', () => {
    const authLoginConfig: SmtpEmailConfig = {
      from: faker.internet.email(),
      host: faker.internet.url(),
      port: 587,
      secure: false,
      ['user' + Constants.encryptSuffix]: faker.internet.email(),
      ['pass' + Constants.encryptSuffix]: faker.internet.password(),
    };

    const mockCreateTransport = nodemailer.createTransport as jest.Mock;
    emailService.setConfig(authLoginConfig);

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: authLoginConfig.host,
      port: 587,
      secure: false,
      auth: {
        user: authLoginConfig['user' + Constants.encryptSuffix],
        pass: authLoginConfig['pass' + Constants.encryptSuffix],
      },
    });
  });

  it('should configure transporter without auth', () => {
    const basicLoginConfig: SmtpEmailConfig = {
      from: faker.internet.email(),
      host: faker.internet.url(),
      port: 587,
      secure: false,
    };

    const mockCreateTransport = nodemailer.createTransport as jest.Mock;
    emailService.setConfig(basicLoginConfig);

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: basicLoginConfig.host,
      port: 587,
      secure: false,
    });
  });
});
