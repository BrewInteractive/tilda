import { HookParams } from '../../models';
import { HookResponse } from './hook-response.interface';

export interface HookInterface {
  execute(params: HookParams): Promise<HookResponse>;
}
