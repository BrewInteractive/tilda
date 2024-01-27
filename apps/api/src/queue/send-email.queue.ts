import { Process, Processor } from '@nestjs/bull';
import { QueueService } from './queue.service';

@Processor('send-email')
export class SendEmailQueue {
  constructor(private readonly queueService: QueueService) {}

  @Process()
  async processSendEmail(job) {
    this.queueService.sendEmailAsync(job.data);
  }
}
