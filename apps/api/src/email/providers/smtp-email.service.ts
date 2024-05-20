import * as nodemailer from 'nodemailer';

import { Email } from '../dto/email.dto';
import { EmailService } from '../email.service';
import { SmtpEmailConfig } from './smtp-email.config';

export class SmtpEmailService extends EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
  }

  setConfig(config: SmtpEmailConfig): void {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  async sendEmailAsync(email: Email): Promise<void> {
    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log('Email sending failed:', error);
    }
  }
}
