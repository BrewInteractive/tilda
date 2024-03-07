import { DataWithUiLabels } from '../manifest/models';
import { EmailParams, WebhookParams } from '../models';
import { WebHookResponse } from './models';

export interface HookInterface {
  execute(
    params: EmailParams | WebhookParams,
    dataWithUi?: DataWithUiLabels[],
  ): Promise<void> | Promise<WebHookResponse>;
}
