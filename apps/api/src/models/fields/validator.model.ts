import { OnMatchType, ValidatorType } from '.';

export interface Validator {
  factory: ValidatorType;
  params?: {
    value?: string;
    minLength?: string;
    maxLength?: string;
    onMatch?: OnMatchType;
    values?: string[];
  };
}
