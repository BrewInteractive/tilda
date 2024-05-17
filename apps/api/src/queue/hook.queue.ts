import {
  OnGlobalQueueError,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';

import { Hook } from '../models';
import { HookFactory } from '../hook/hook.factory';

@Processor('hook-queue')
export class HookQueue {
  constructor(private readonly hookFactory: HookFactory) {}

  @OnQueueError()
  OnQueueError(err: Error) {
    console.error('hook-queue OnQueueError', err);
  }

  @OnGlobalQueueError()
  OnGlobalQueueError(err: Error) {
    console.error('hook-queue OnGlobalQueueError', err);
  }

  @Process()
  async processHook(job: { data: { hook: Hook } }) {
    const { factory, params } = job.data.hook;
    const hookProcesser = this.hookFactory.getProcessor(factory);
    await hookProcesser.execute(params);
  }
}
