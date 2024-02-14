import { Module } from '@nestjs/common';
import { HookService } from './hook.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [HookService],
  exports: [HookService],
})
export class HookModule {}
