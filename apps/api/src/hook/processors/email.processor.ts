import { Constants, DataWithUiLabels, EmailParams } from '../../models';
import { Injectable, Type } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Email } from '../../email/dto/email.dto';
import { EmailService } from '../../email/email.service';
import { EmailServiceType } from '../../email/enum/email.service.type.enum';
import { HookInterface } from '../models/hook.interface';
import { HookResponse } from '../models/hook-response.interface';
import { ModuleRef } from '@nestjs/core';
import { SmtpEmailService } from '../../email/providers/smtp-email.service';

@Injectable()
export class EmailProcessor implements HookInterface {
  private readonly emailServiceMap: {
    [key in EmailServiceType]: Type<EmailService>;
  };

  constructor(
    private moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {
    this.emailServiceMap = {
      [EmailServiceType.SMTP]: SmtpEmailService,
    };
  }

  async execute(params: EmailParams): Promise<HookResponse> {
    const emailServiceClass = this.emailServiceMap[params.serviceType];

    const emailService = this.moduleRef.get(emailServiceClass, {
      strict: false,
    });

    const emails = this.getEmailList(params);

    emailService.setConfig(params.config);

    for (const email of emails) {
      await emailService.sendEmailAsync(email);
    }

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }

  getEmailList(params: EmailParams): Email[] {
    const emailList: Email[] = [];
    for (const recipient of params.recipients) {
      const recipientEmail = recipient[Constants.emailSuffix];

      if (recipientEmail) {
        const htmlContent = this.generateHtmlContent(params.dataWithUi);

        const email = {
          from: params.config.from,
          to: recipientEmail,
          subject: 'Tilda Run For Validation Result',
          html: htmlContent,
        } as Email;

        emailList.push(email);
      }
    }
    return emailList;
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
