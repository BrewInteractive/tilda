import { EmailRequest } from '../models';
import { HookInterface } from '../models/hook.interface';
import { HookResponse } from '../models/hook-response.interface';
import { Inject, Injectable } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '@nestjs/config';
import { DataWithUiLabels } from '../../models';
import { Email } from '../../email/dto/email.dto';

@Injectable()
export class EmailProcessor implements HookInterface {
  constructor(
    @Inject('EmailService') private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}
  async execute(params: EmailRequest): Promise<HookResponse> {
    this.sendEmailAsync(params);
    return {
      success: true,
      message: 'Email sent successfully',
    };
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

  generateHtmlContent(dataWithUi?: DataWithUiLabels): string {
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
