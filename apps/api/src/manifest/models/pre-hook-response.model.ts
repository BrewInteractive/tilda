import { HookType } from '../../models';

export class PreHookResponse {
  success: boolean;
  signature?: string;
  id: string;
  response?: {
    status: number;
    headers: any;
    data: any;
  };
  message?: string;
  factory?: HookType;
  params?: any;
  ignoreSuccess: boolean;
}
