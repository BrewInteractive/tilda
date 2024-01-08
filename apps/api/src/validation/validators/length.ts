import { ValidatorInterface } from '../validator.interface';
import { InvalidArgumentException } from './exceptions';

export class Length implements ValidatorInterface {
  getValidator(params: any): any {
    if (params?.minLength || params?.maxLength) {
      const validator: any = {};
      validator.type = 'string';

      if (params.minLength) {
        validator.minLength = parseInt(params.minLength, 10) || 0;
      }
      if (params.maxLength) {
        validator.maxLength = parseInt(params.maxLength, 10) || undefined;
      }

      return validator;
    }
    throw new InvalidArgumentException();
  }
}
