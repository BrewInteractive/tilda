import { ValidatorInterface } from '../validator.interface';

export class Numeric implements ValidatorInterface {
  getValidator(): any {
    return {
      type: 'string',
      pattern: '^[0-9]+$',
    };
  }
}
