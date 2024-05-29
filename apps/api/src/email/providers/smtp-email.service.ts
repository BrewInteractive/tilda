import * as nodemailer from 'nodemailer';

import { Email } from '../dto/email.dto';
import { EmailService } from '../email.service';
import { SmtpEmailConfig } from './smtp-email.config';
import { Constants } from '../../models';

export class SmtpEmailService extends EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
  }

  setConfig(config: SmtpEmailConfig): void {
    const smtpOptions: nodemailer.TransportOptions = {
      host: config.host || config['host' + Constants.encryptSuffix],
      port: config.port,
      secure: config.secure,
    };

    if (config.user || config['user' + Constants.encryptSuffix] && config.pass || config['pass' + Constants.encryptSuffix]) {
      smtpOptions.auth = {
        user: config.user || config['user' + Constants.encryptSuffix],
        pass: config.pass || config['pass' + Constants.encryptSuffix],
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
