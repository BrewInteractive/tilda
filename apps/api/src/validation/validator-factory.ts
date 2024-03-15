import { ValidatorType } from '../models';
import { ValidatorInterface } from './validator.interface';
import {
  AlphaNumeric,
  Alpha,
  Numeric,
  Enum,
  Length,
  NotEmpty,
  Regex,
} from './validators';

export class ValidatorFactory {
  private validatorCollection: Map<ValidatorType, ValidatorInterface>;

  constructor() {
    this.validatorCollection = new Map([
      [ValidatorType.alpha, new Alpha()],
      [ValidatorType.numeric, new Numeric()],
      [ValidatorType.alphanumeric, new AlphaNumeric()],
      [ValidatorType.enum, new Enum()],
      [ValidatorType.length, new Length()],
      [ValidatorType.notEmpty, new NotEmpty()],
      [ValidatorType.regex, new Regex()],
    ]);
  }

  getValidator(validatorType: ValidatorType): ValidatorInterface | undefined {
    return this.validatorCollection.get(validatorType);
  }
}
