import { CustomValidation } from '../custom-validation';

export class Numeric implements CustomValidation {
  getValidation(): any {
    return {
      type: 'string',
      pattern: '^[0-9]+$',
    };
  }
}
