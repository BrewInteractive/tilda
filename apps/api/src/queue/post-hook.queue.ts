import { Process, Processor } from '@nestjs/bull';
import { QueueService } from './queue.service';

@Processor('post-hook')
export class PostHookQueue {
  constructor(private readonly queueService: QueueService) {}

  @Process()
  async processPostHook(job) {
    await this.queueService.sendWebhookAsync(job.data);
  }
}
