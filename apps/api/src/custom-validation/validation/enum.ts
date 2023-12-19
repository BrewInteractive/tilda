import { CustomValidation } from '../custom-validation';
import { InvalidArgumentException } from './exceptions';

export class Enum implements CustomValidation {
  getValidation(params: any): any {
    if (params?.values) {
      return {
        type: 'string',
        enum: params.values,
      };
    }
    throw new InvalidArgumentException();
  }
}
