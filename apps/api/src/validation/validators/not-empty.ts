import { ValidatorInterface } from '../validator.interface';

export class NotEmpty implements ValidatorInterface {
  getValidator(): any {
    return {
      type: 'string',
      minLength: 1,
    };
  }
}
