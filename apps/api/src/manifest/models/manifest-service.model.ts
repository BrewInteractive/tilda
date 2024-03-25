import { HookType } from '../../models';

export class DataWithUiLabels {
  [key: string]: string;
}

export class PreHookResponse {
  success?: any;
  signature?: string;
  response?: {
    status: number;
    headers: any;
    data: any;
  };
  data?: any;
  message?: string;
  factory?: HookType;
  params?: any;
}
