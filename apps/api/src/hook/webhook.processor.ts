import { HookInterface } from './hook.interface';
import { HookService } from './hook.service';
import { WebHookResponse } from './models';
import { WebhookParams } from '../models';

export class WebhookProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(params: WebhookParams): Promise<WebHookResponse> {
    return this.hookService.sendWebhookAsync(params);
  }
}
