import { Inject, Injectable } from '@nestjs/common';
import axios, {
  AxiosError,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from 'axios';
import { EmailRequest, WebHookRequest } from './models';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { Email } from '../email/dto/email.dto';

@Injectable()
export class HookService {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendWebhookAsync(params: WebHookRequest): Promise<{
    response: {
      status: number;
      headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
      data: any;
    };
  }> {
    try {
      const { url, headers, method, values } = params;

      const requestData = {};
      for (const key in values) {
        requestData[key] = values[key];
      }

      const result = await axios({
        method,
        url,
        headers,
        params: requestData,
      });

      return {
        response: {
          status: result.status,
          headers: result.headers,
          data: result.data,
        },
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error Message:', error.message);
        return {
          response: {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          },
        };
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
