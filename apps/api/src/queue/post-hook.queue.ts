import { Process, Processor } from '@nestjs/bull';
import { HookService } from '../hook/hook.service';

@Processor('post-hook')
export class PostHookQueue {
  constructor(private readonly hookService: HookService) {}

  @Process()
  async processPostHook(job) {
    await this.hookService.sendWebhookAsync(job.data);
  }
}
