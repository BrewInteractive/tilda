import { Process, Processor } from '@nestjs/bull';

@Processor('post-hook')
export class PostHookProcessor {
  @Process()
  async processPostHook(job) {
    console.log('Processing post hook:', job.data);
  }
}
