import { CustomValidation } from '../custom-validation';
import { InvalidArgumentException } from './exceptions';

export class Regex implements CustomValidation {
  getValidation(params: any): any {
    if (params && params.value && params.onMatch) {
      return {
        type: 'string',
        pattern: params.value,
      };
    }
    throw new InvalidArgumentException();
  }
}
