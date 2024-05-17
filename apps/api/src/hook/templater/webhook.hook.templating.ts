import { HookTemplating } from './hook.templating';
import { WebhookParams } from '../../models';

export class WebhookTemplating extends HookTemplating {
  applyTemplate(
    params: WebhookParams,
    templateKeyPairs: { [key: string]: string },
  ): void {
    params.values = this.transformTemplateValues(
      params.values,
      templateKeyPairs,
    );
    params.headers = this.transformTemplateValues(
      params.headers,
      templateKeyPairs,
    );
  }
}
