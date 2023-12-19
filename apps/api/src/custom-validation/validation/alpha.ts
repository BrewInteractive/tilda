import { CustomValidation } from '../custom-validation';

export class Alpha implements CustomValidation {
  getValidation(): any {
    return {
      type: 'string',
      pattern: '^[a-zA-Z]+$',
    };
  }
}
