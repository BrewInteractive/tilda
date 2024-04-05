import { ValidatorInterface } from '../validator.interface';

export class AlphaNumeric implements ValidatorInterface {
  getValidator(): any {
    return {
      type: 'string',
      pattern: '^[a-zA-Z0-9\\sçÇğĞıİöÖşŞüÜ]+$',
    };
  }
}
