import { SmtpEmailService } from './smtp-email.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SmtpEmailConfig } from './smtp-email.config';
import { EmailFixture } from '../../../test/fixtures/email/email.fixture';
import { MockFactory } from 'mockingbird';
import * as nodemailer from 'nodemailer';
import { faker } from '@faker-js/faker';

jest.mock('nodemailer');
const sendMailMock = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

describe('SmtpEmailService', () => {
  let emailService: SmtpEmailService;
  const config = {
    host: faker.internet.url(),
    port: faker.number.int(),
    secure: faker.datatype.boolean(),
    auth: {
      user: faker.internet.email(),
      pass: faker.internet.password(),
    },
  } as SmtpEmailConfig;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmtpEmailService,
        {
          provide: 'SmtpEmailConfig',
          useValue: config,
        },
      ],
    }).compile();

    emailService = module.get<SmtpEmailService>(SmtpEmailService);
  });

  it('should send an email successfully', async () => {
    // Arrange
    const email = MockFactory(EmailFixture).one();

    // Act
    await emailService.sendEmailAsync(email);

    // Assert
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({ ...email });
  });
});
