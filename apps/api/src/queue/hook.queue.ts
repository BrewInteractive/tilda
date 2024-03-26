import {
  OnGlobalQueueError,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';

import { HookFactory } from '../hook/hook.factory';
import { HookService } from '../hook/hook.service';

@Processor('hook-queue')
export class HookQueue {
  constructor(private readonly hookService: HookService) {}

  @OnQueueError()
  OnQueueError(err: Error) {
    console.error('hook-queue OnQueueError', err);
  }

  @OnGlobalQueueError()
  OnGlobalQueueError(err: Error) {
    console.error('hook-queue OnGlobalQueueError', err);
  }

  @Process()
  async processHook(job) {
    const { factory, params } = job.data.hook;

    await HookFactory.getHook(factory, this.hookService).execute(params);
  }
}
