import { HookParams } from '../models';
import { WebHookResponse } from './models';

export interface HookInterface {
  execute(params: HookParams): Promise<void> | Promise<WebHookResponse>;
}
