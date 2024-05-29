import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SmtpEmailService } from './providers/smtp-email.service';

@Module({
  imports: [ConfigModule],
  providers: [SmtpEmailService],
  exports: [],
})
export class EmailModule {}
