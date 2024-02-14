import { Process, Processor } from '@nestjs/bull';
import { HookService } from '../hook/hook.service';

@Processor('send-email')
export class SendEmailQueue {
  constructor(private readonly hookService: HookService) {}

  @Process()
  async processSendEmail(job) {
    this.hookService.sendEmailAsync(job.data);
  }
}
