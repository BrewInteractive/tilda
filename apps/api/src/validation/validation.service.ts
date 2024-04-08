import Ajv from 'ajv';
import { Inject, Injectable } from '@nestjs/common';
import { Field, TildaData, Validator, ValidatorType } from '../models';
import { ValidatorFactory } from './validator-factory';
import { ValidationResult } from './models/validation-result';

@Injectable()
export class ValidationService {
  constructor(
    @Inject('ValidatorFactory')
    private readonly validatorFactory: ValidatorFactory,
    @Inject('Ajv')
    private readonly ajv: Ajv,
  ) {}

  applyValidatorToSchema(
    schema: any,
    validator: Validator,
    fieldName: string,
  ): void {
    const { factory, params } = validator;
    const customValidator = this.validatorFactory.getValidator(factory);
    if (customValidator) {
      // If the field is required, add it to the schema required array
      if (factory === ValidatorType.notEmpty) {
        schema.required = schema.required || [];
        schema.required.push(fieldName);
      }
      schema.properties[fieldName] = {
        ...schema.properties[fieldName],
        ...customValidator.getValidator(params),
      };
    }
  }
  private generateSchemaFromManifest(manifest: TildaData): any {
    const schema: any = { type: 'object', properties: {} };

    for (const fieldName in manifest.fields) {
      const field: Field = manifest.fields[fieldName];
      const fieldValidators: Validator[] = field.validators || [];

      for (const validator of fieldValidators) {
        this.applyValidatorToSchema(schema, validator, fieldName);
      }
    }

    return schema;
  }

  validate(data: any, manifest: TildaData): ValidationResult {
    const generalSchema = this.generateSchemaFromManifest(manifest);

    const validate = this.ajv.compile(generalSchema);

    const isValid = validate(data);
    if (!isValid) return this.mapValidationErrors(validate);

    return { success: true };
  }

  private mapValidationErrors(validate: any): ValidationResult {
    return {
      success: false,
      errors:
        validate.errors?.map((error) => ({
          path: error.schemaPath,
          message: error.message,
        })) || [],
    };
  }
}
