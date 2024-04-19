import { HookParams } from '../../models/hooks';

export interface DataCordParams extends HookParams {
  url?: string;
  values?: { [key: string]: string };
  success?: string;
}
