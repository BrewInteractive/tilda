import { CustomValidation } from '../custom-validation';
import { InvalidArgumentException } from './exceptions';

export class Length implements CustomValidation {
  getValidation(params: any): any {
    if (params && (params.minLength || params.maxLength)) {
      const validation: any = {};
      validation.type = 'string';

      if (params.minLength) {
        validation.minLength = parseInt(params.minLength, 10) || 0;
      }
      if (params.maxLength) {
        validation.maxLength = parseInt(params.maxLength, 10) || undefined;
      }

      return validation;
    }
    throw new InvalidArgumentException();
  }
}
