import { ValidationResult } from '../../validation/models/validation-result';

export class GetManifestError extends Error {}
export class InvalidValidationError extends Error {
  public validationResult: ValidationResult;

  constructor(validationResult: ValidationResult) {
    super();
    this.validationResult = validationResult;
  }
}
