import { HookParams, WebhookHttpMethod } from '.';

export interface WebhookParams extends HookParams {
  url: string;
  headers?: { [key: string]: string };
  method: WebhookHttpMethod;
  values?: { [key: string]: string };
  success_path?: string;
}
