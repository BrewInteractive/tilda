import { HookParams } from '../../models/hooks';

export interface DataCordParams extends HookParams {
  values?: { [key: string]: string };
  success?: string;
}
