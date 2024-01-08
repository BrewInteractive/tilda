import { ValidatorInterface } from '../validator.interface';
import { InvalidArgumentException } from './exceptions';

export class Enum implements ValidatorInterface {
  getValidator(params: any): any {
    if (params?.values) {
      return {
        type: 'string',
        enum: params.values,
      };
    }
    throw new InvalidArgumentException();
  }
}
