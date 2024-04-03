import { HookInterface } from './models/hook.interface';
import { HookService } from './hook.service';
import { Injectable } from '@nestjs/common';
import { WebHookResponse } from './models';
import { WebhookParams } from '../models';

@Injectable()
export class WebhookProcessor implements HookInterface {
  constructor(private readonly hookService: HookService) {}
  async execute(params: WebhookParams): Promise<WebHookResponse> {
    return this.hookService.sendWebhookAsync(params);
  }
}
