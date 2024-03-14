import { ConstObject, UIObject, Validator } from '.';

export interface Field {
  inputName?: string;
  ui?: UIObject;
  const?: ConstObject;
  validators?: Validator[];
}
