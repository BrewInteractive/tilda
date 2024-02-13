import { Inject, Injectable } from '@nestjs/common';
import { EmailRequest } from './models';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { Email } from '../email/dto/email.dto';

@Injectable()
export class QueueService {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}
  async sendEmailAsync(params: EmailRequest): Promise<any> {
    for (const recipient of params.recipients) {
      const recipientEmail = recipient['email:enc'];

      if (recipientEmail) {
        const email = {
          from: this.configService.get('SMTP.AUTH.USER'),
          to: recipientEmail,
          subject: 'Hello World',
          text: 'Hello World',
        } as Email;

        this.emailService.sendEmailAsync(email);
      }
    }
  }
}
