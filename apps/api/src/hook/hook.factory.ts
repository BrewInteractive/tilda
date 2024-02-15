import { HookInterface } from './hook.interface';
import { HookService } from './hook.service';
import { EmailProcessor } from './email.processor';
import { WebhookProcessor } from './webhook.processor';
import { HookType } from '../models/hooks/hook-type.enum';
export class HookFactory {
  static hook = new Map<HookType, (hookService: HookService) => HookInterface>([
    [
      HookType.email,
      (hookService: HookService) => new EmailProcessor(hookService),
    ],
    [
      HookType.webhook,
      (hookService: HookService) => new WebhookProcessor(hookService),
    ],
  ]);

  static getHook(type: HookType, hookService: HookService): HookInterface {
    const hookCreator = HookFactory.hook.get(type);
    if (hookCreator) {
      return hookCreator(hookService);
    } else {
      throw new Error(`Unsupported hook type: ${type}`);
    }
  }
}
