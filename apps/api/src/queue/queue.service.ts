import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { EmailRequest, PostHookRequest } from './models';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { Email } from '../email/dto/email.dto';

@Injectable()
export class QueueService {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}
  async sendWebhookAsync(params: PostHookRequest): Promise<any> {
    try {
      const { url, headers, method, values } = params;

      const requestData = {};
      for (const key in values) {
        requestData[key] = values[key];
      }

      await axios({
        method,
        url,
        headers,
        data: requestData,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error Message:', error.message);
      } else {
        console.error('Eror Message:', error.message);
        throw error;
      }
    }
  }
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
