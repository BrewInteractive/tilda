import { CustomValidation } from '../custom-validation';

export class AlphaNumeric implements CustomValidation {
  getValidation(): any {
    return {
      type: 'string',
      pattern: '^[a-zA-Z0-9]+$',
    };
  }
}
