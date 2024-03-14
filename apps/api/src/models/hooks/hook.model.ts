import { HookType } from './hook-type.enum';

export interface WebhookParams {
  url: string;
  headers?: string[];
  method: string;
  values?: { [key: string]: string };
}

export interface EmailRecipient {
  'email:enc': string;
}

export interface EmailParams {
  recipients: EmailRecipient[];
}

export interface Hook {
  signature?: string;
  factory: HookType;
  params: WebhookParams | EmailParams;
}

export interface Hooks {
  pre?: Hook[];
  post?: Hook[];
}
