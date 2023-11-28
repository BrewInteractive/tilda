import { ValidatorType } from './validator-type.enum';

export interface Validator {
  factory: ValidatorType;
  params?: {
    value?: string;
    minLength?: string;
    maxLength?: string;
    onMatch?: 'fail' | 'pass';
    values?: string[];
  };
}
