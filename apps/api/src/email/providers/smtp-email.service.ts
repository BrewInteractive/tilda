import { Email } from '../dto/email.dto';
import { EmailService } from '../email.service';
import { SmtpEmailConfig } from './smtp-email.config';
import { Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export class SmtpEmailService extends EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject('SmtpEmailConfig') private readonly smtpConfig: SmtpEmailConfig,
  ) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: {
        user: this.smtpConfig.auth.user,
        pass: this.smtpConfig.auth.pass,
      },
    });
  }

  async sendEmailAsync(email: Email): Promise<void> {
    const mailInfo = {
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    };

    await this.transporter.sendMail(mailInfo);
  }
}
