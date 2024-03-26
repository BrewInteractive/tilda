import { DataWithUiLabels } from '../manifest/models';
import { HookParams } from '../models';
import { WebHookResponse } from './models';

export interface HookInterface {
  execute(
    params: HookParams,
    dataWithUi?: DataWithUiLabels[],
  ): Promise<void> | Promise<WebHookResponse>;
}
