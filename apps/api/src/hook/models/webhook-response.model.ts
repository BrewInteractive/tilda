import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

import { HookResponse } from './hook-response.interface';

export class WebHookResponse implements HookResponse {
  message: string;
  response: {
    status: number;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    data: any;
  };
  success: boolean;
}
