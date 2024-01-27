import { Process, Processor } from '@nestjs/bull';
import { EmailService } from '../email/email.service';
import { Inject } from '@nestjs/common';
import { Email } from '../email/dto/email.dto';
import { ConfigService } from '@nestjs/config';

@Processor('send-email')
export class SendEmailQueue {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Process()
  async processSendEmail(job) {
    for (const recipient of job.data.recipients) {
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
