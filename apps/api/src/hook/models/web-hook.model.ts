import { RawAxiosResponseHeaders, AxiosResponseHeaders } from 'axios';

export class WebHookResponse {
  response: {
    status: number;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    data: any;
  };
}
