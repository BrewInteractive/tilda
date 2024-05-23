import { ValidatorInterface } from '../validator.interface';

export class Alpha implements ValidatorInterface {
  getValidator(): any {
    return {
      type: 'string',
      pattern: '^[a-zA-Z\\sçÇğĞıİöÖşŞüÜ]*$',
    };
  }
}
