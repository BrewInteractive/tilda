export class WebHookRequest {
  url: string;
  headers?: { [key: string]: string };
  method: string;
  values?: { [key: string]: string };
}
