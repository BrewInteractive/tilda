import { HookInterface } from './hook.interface';
import { HookService } from './hook.service';

export class WebhookProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(params: any): Promise<any> {
    return this.hookService.sendWebhookAsync(params);
  }
}
