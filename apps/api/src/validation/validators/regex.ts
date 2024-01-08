import { ValidatorInterface } from '../validator.interface';
import { InvalidArgumentException } from './exceptions';

export class Regex implements ValidatorInterface {
  getValidator(params: any): any {
    if (params?.value && params?.onMatch) {
      return {
        type: 'string',
        pattern: params.value,
      };
    }
    throw new InvalidArgumentException();
  }
}
