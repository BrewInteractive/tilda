import { Field } from '../fields';
import { Hooks } from '../hooks';

export interface TildaData {
  fields: { [key: string]: Field };
  hooks: Hooks;
}

export interface TildaManifest {
  hmac: string;
  data: TildaData;
}
