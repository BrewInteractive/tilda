import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { EmailRequest, WebHookResponse } from './models';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { Email } from '../email/dto/email.dto';
import { DataWithUiLabels } from '../manifest/models';
import { WebhookParams } from '../models';

@Injectable()
export class HookService {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendWebhookAsync(params: WebhookParams): Promise<WebHookResponse> {
    try {
      const { url, headers: headerStrings, method, values } = params;
      const headers = {};

      for (const header of headerStrings) {
        const index = header.indexOf(':');
        const key = header.substring(0, index).trim();
        const value = header.substring(index + 1).trim();
        headers[key] = value;
      }

      const requestData = {};
      for (const key in values) {
        requestData[key] = values[key];
      }

      const result = await axios({
        method,
        url,
        headers,
        params: requestData,
        data: requestData,
      });

      console.info('Webhook Request:', requestData);
      console.info('Webhook Response:', result.status, result.data);

      return {
        response: {
          status: result.status,
          headers: result.headers,
          data: result.data,
        },
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('AxiosError Message:', error.message);
        return {
          response: {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          },
        };
      } else {
        console.error('Error Message:', error.message);
        throw error;
      }
    }
  }
  async sendEmailAsync(
    params: EmailRequest,
    dataWithUi?: DataWithUiLabels[],
  ): Promise<void> {
    for (const recipient of params.recipients) {
      const recipientEmail = recipient['email:enc'];

      if (recipientEmail) {
        const htmlContent = this.generateHtmlContent(dataWithUi);

        const email = {
          from: this.configService.get('SMTP.AUTH.USER'),
          to: recipientEmail,
          subject: 'Tilda Run For Validation Result',
          html: htmlContent,
        } as Email;

        this.emailService.sendEmailAsync(email);
      }
    }
  }
  private generateHtmlContent(dataWithUi?: DataWithUiLabels[]): string {
    let htmlContent = '<html><body>';

    if (dataWithUi) {
      for (const obj of dataWithUi) {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            htmlContent += `<p>${key}: ${obj[key]}</p>`;
          }
        }
      }
    }

    htmlContent += '</body></html>';
    return htmlContent;
  }
}
