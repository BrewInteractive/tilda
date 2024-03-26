import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailServiceType } from './enum/email.service.type.enum';
import { Module } from '@nestjs/common';
import { SmtpEmailConfig } from './providers/smtp-email.config';
import { SmtpEmailService } from './providers/smtp-email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SmtpEmailConfig',
      useFactory: (configService: ConfigService) =>
        ({
          host: configService.get<string>('SMTP.HOST'),
          port: configService.get<number>('SMTP.PORT'),
          secure: configService.get<boolean>('SMTP.SECURE'),
          auth: {
            user: configService.get<string>('SMTP.AUTH.USER'),
            pass: configService.get<string>('SMTP.AUTH.PASS'),
          },
        }) as SmtpEmailConfig,
      inject: [ConfigService],
    },
    SmtpEmailService,
    {
      provide: 'EmailService',
      useFactory: (
        smtpEmailService: SmtpEmailService,
        configService: ConfigService,
      ) => {
        const emailServiceType = configService.get(
          'EMAIL_SERVICE',
        ) as EmailServiceType;

        if (emailServiceType === EmailServiceType.SMTP) return smtpEmailService;
        else throw new Error('Invalid email service type');
      },
      inject: [SmtpEmailService, ConfigService],
    },
  ],
  exports: ['EmailService'],
})
export class EmailModule {}
