import { Injectable, Type } from '@nestjs/common';

import { DataCordProcessor } from './processors/datacord.processor';
import { EmailProcessor } from './processors/email.processor';
import { HookInterface } from './models/hook.interface';
import { HookType } from '../models';
import { ModuleRef } from '@nestjs/core';
import { WebhookProcessor } from './processors/webhook.processor';

@Injectable()
export class HookProcessorFactory {
  private readonly processorMap: { [key in HookType]: Type<HookInterface> };

  constructor(private moduleRef: ModuleRef) {
    this.processorMap = {
      [HookType.email]: EmailProcessor,
      [HookType.webhook]: WebhookProcessor,
      [HookType.datacord]: DataCordProcessor,
    };
  }

  getProcessor(hookType: HookType): HookInterface {
    const processorClass = this.processorMap[hookType];
    if (!processorClass) {
      throw new Error(`Unsupported hook type: ${hookType}`);
    }
    return this.moduleRef.get(processorClass, { strict: false });
  }
}
