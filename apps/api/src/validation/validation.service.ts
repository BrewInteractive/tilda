import Ajv from 'ajv';
import { Inject, Injectable } from '@nestjs/common';
import { Field, TildaData, Validator } from '../models';
import { ValidatorFactory } from './validator-factory';
import { ValidationResult } from './models/validation-result';

@Injectable()
export class ValidationService {
  constructor(
    @Inject('ValidatorFactory')
    private readonly validatorFactory: ValidatorFactory,
  ) {}

  private addValidatorToSchema(
    schema: any,
    validator: Validator,
    fieldName: string,
  ): void {
    const { factory, params } = validator;
    const customValidator = this.validatorFactory.getValidator(factory);

    if (customValidator) {
      schema.properties[fieldName] = customValidator.getValidator(params);
    }
  }

  private generateSchemaFromManifest(manifest: TildaData): any {
    const schema: any = { type: 'object', properties: {} };

    for (const fieldName in manifest.fields) {
      const field: Field = manifest.fields[fieldName];
      const fieldValidators: Validator[] = field.validators || [];

      for (const validator of fieldValidators) {
        this.addValidatorToSchema(schema, validator, fieldName);
      }
    }

    return schema;
  }

  validate(data: any, manifest: TildaData): ValidationResult {
    const ajv = new Ajv({ allErrors: true });
    const generalSchema = this.generateSchemaFromManifest(manifest);

    const validate = ajv.compile(generalSchema);

    const isValid = validate(data);
    if (!isValid) {
      return {
        success: false,
        errors:
          validate.errors?.map((error) => ({
            path: error.schemaPath,
            message: error.message,
          })) || [],
      };
    }

    return { success: true };
  }
}
