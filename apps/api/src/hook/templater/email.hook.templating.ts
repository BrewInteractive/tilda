import { HookTemplating } from './hook.templating';
import { WebhookParams } from '../../models';

export class EmailTemplating extends HookTemplating {
  applyTemplate(
    params: WebhookParams,
    templateKeyPairs: { [key: string]: string },
  ): void {
    console.log('EmailTemplating', params, templateKeyPairs);
  }
}
