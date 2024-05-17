import { Injectable, Type } from '@nestjs/common';

import { DataCordProcessor } from './processors/datacord.processor';
import { DataCordTemplating } from './templater/datacord.hook.templating';
import { EmailProcessor } from './processors/email.processor';
import { HookInterface } from './models/hook.interface';
import { HookTemplatingInterface } from './templater/hook.templating';
import { HookType } from '../models';
import { ModuleRef } from '@nestjs/core';
import { WebhookProcessor } from './processors/webhook.processor';
import { WebhookTemplating } from './templater/webhook.hook.templating';

@Injectable()
export class HookFactory {
  private readonly processorMap: { [key in HookType]: Type<HookInterface> };
  private readonly hookTemplatingMap: {
    [key in HookType]: Type<HookTemplatingInterface>;
  };

  constructor(private moduleRef: ModuleRef) {
    this.processorMap = {
      [HookType.email]: EmailProcessor,
      [HookType.webhook]: WebhookProcessor,
      [HookType.datacord]: DataCordProcessor,
    };

    this.hookTemplatingMap = {
      [HookType.email]: WebhookTemplating,
      [HookType.webhook]: WebhookTemplating,
      [HookType.datacord]: DataCordTemplating,
    };
  }

  getProcessor(hookType: HookType): HookInterface {
    const processorClass = this.processorMap[hookType];
    if (!processorClass) {
      throw new Error(`Unsupported hook type: ${hookType}`);
    }
    return this.moduleRef.get(processorClass, { strict: false });
  }

  getTemplating(hookType: HookType): HookTemplatingInterface {
    const templatingClass = this.hookTemplatingMap[hookType];
    if (!templatingClass) {
      throw new Error(`Unsupported hook type: ${hookType}`);
    }
    return this.moduleRef.get(templatingClass, { strict: false });
  }
}
