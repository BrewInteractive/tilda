import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { EmailRequest, WebHookResponse } from './models';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { Email } from '../email/dto/email.dto';
import { DataWithUiLabels, WebhookHttpMethod, WebhookParams } from '../models';

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

      const axiosConfig = {
        method,
        url,
        headers,
      } as AxiosRequestConfig;

      if (method === WebhookHttpMethod.POST) {
        axiosConfig.data = requestData;
      }

      if (method === WebhookHttpMethod.GET) {
        axiosConfig.params = requestData;
      }

      const result = await axios(axiosConfig);

      console.log('Webhook Request Detail:', axiosConfig);
      console.log('Webhook Response Detail:', result.status, result.data);

      return {
        response: {
          status: result.status,
          headers: result.headers,
          data: result.data,
        },
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('AxiosError:', error.message);
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
  async sendEmailAsync(params: EmailRequest): Promise<void> {
    for (const recipient of params.recipients) {
      const recipientEmail = recipient['email:enc'];

      if (recipientEmail) {
        const htmlContent = this.generateHtmlContent(params.dataWithUi);

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
  private generateHtmlContent(dataWithUi?: DataWithUiLabels): string {
    let htmlContent = '<html><body>';

    if (dataWithUi) {
      for (const key in dataWithUi) {
        htmlContent += `<p>${key}: ${dataWithUi[key]}</p>`;
      }
    }

    htmlContent += '</body></html>';
    return htmlContent;
  }
}
