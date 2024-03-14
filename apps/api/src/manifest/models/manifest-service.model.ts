import { HookType } from '../../models/hooks/hook-type.enum';

export class DataWithUiLabels {
  [key: string]: string;
}

export class PreHookResponse {
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
