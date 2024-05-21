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
    const smtpOptions: nodemailer.TransportOptions = {
      host: config.host || config['host:enc'],
      port: config.port,
      secure: config.secure,
    };

    if (config.user || config["user:enc"] && config.pass || config['pass:enc']) {
      smtpOptions.auth = {
        user: config.user || config['user:enc'],
        pass: config.pass || config['pass:enc'],
      };
    }

    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  async sendEmailAsync(email: Email): Promise<void> {
    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log('Email sending failed:', error);
    }
  }
}
