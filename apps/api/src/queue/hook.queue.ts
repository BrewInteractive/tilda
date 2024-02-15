import { Process, Processor } from '@nestjs/bull';
import { HookService } from '../hook/hook.service';
import { HookFactory } from '../hook/hook.factory';

@Processor('hook-queue')
export class HookQueue {
  constructor(private readonly hookService: HookService) {}

  @Process()
  async processHook(job) {
    const { factory, params } = job.data;

    await HookFactory.getHook(factory, this.hookService).execute(params);
  }
}
