import { HookParams, HookType } from '.';

export interface Hook {
  signature?: string;
  id?: string;
  factory: HookType;
  params: HookParams;
  ignoreSuccess?: boolean;
}
