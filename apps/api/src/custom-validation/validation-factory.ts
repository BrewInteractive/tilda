import { ValidatorType } from '../models/fields/validator-type.enum';
import {
  AlphaNumeric,
  Alpha,
  Numeric,
  Enum,
  Length,
  NotEmpty,
  Regex,
} from './validation';

interface Validation {
  getValidation(params?: any): any;
}

export class ValidationFactory {
  private validation: Map<ValidatorType, Validation>;

  constructor() {
    this.validation = new Map([
      [ValidatorType.alpha, new Alpha()],
      [ValidatorType.numeric, new Numeric()],
      [ValidatorType.alphanumeric, new AlphaNumeric()],
      [ValidatorType.enum, new Enum()],
      [ValidatorType.length, new Length()],
      [ValidatorType.notEmpty, new NotEmpty()],
      [ValidatorType.regex, new Regex()],
    ]);
  }

  getValidation(factory: ValidatorType): Validation | undefined {
    return this.validation.get(factory);
  }
}
