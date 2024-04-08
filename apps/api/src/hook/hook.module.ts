import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { EmailProcessor } from './processors/email.processor';
import { HookProcessorFactory } from './hook.factory';
import { Module } from '@nestjs/common';
import { WebhookProcessor } from './processors/webhook.processor';

@Module({
  imports: [EmailModule, ConfigModule],
  providers: [EmailProcessor, WebhookProcessor, HookProcessorFactory],
  exports: [HookProcessorFactory],
})
export class HookModule {}
