import { ConfigModule } from '@nestjs/config';
import { DataCordProcessor } from './processors/datacord.processor';
import { DataCordTemplating } from './templater/datacord.hook.templating';
import { EmailModule } from '../email/email.module';
import { EmailProcessor } from './processors/email.processor';
import { EmailTemplating } from './templater/email.hook.templating';
import { HookFactory } from './hook.factory';
import { Module } from '@nestjs/common';
import { WebhookProcessor } from './processors/webhook.processor';
import { WebhookTemplating } from './templater/webhook.hook.templating';

@Module({
  imports: [EmailModule, ConfigModule],
  providers: [
    EmailProcessor,
    WebhookProcessor,
    DataCordProcessor,
    WebhookTemplating,
    DataCordTemplating,
    EmailTemplating,
    HookFactory,
  ],
  exports: [HookFactory],
})
export class HookModule {}
