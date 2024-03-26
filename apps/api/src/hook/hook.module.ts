import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { EmailProcessor } from './email.processor';
import { HookProcessorFactory } from './hook.factory';
import { HookService } from './hook.service';
import { Module } from '@nestjs/common';
import { WebhookProcessor } from './webhook.processor';

@Module({
  imports: [EmailModule, ConfigModule],
  providers: [
    HookService,
    EmailProcessor,
    WebhookProcessor,
    HookProcessorFactory,
  ],
  exports: [HookService, HookProcessorFactory],
})
export class HookModule {}
