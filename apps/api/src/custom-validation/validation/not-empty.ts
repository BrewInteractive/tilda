import { CustomValidation } from '../custom-validation';

export class NotEmpty implements CustomValidation {
  getValidation(): any {
    return {
      type: 'string',
      minLength: 1,
    };
  }
}
