import { OnMatchType } from './on-match-type.enum';
import { ValidatorType } from './validator-type.enum';

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
