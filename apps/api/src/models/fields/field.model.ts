import { Validator } from './validator.model';
import { ConstObject } from './const.model';
import { UIObject } from './ui.model';

export interface Field {
  inputName?: string;
  ui?: UIObject;
  const?: ConstObject;
  validators?: Validator[];
}
