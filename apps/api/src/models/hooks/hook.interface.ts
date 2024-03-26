import { HookParams, HookType } from '.';

export interface Hook {
  signature?: string;
  factory: HookType;
  params: HookParams;
}
