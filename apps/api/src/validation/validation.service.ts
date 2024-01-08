import Ajv from 'ajv';
import { Injectable } from '@nestjs/common';
import { Field, TildaData, Validator } from '../models';
import { ValidatorFactory } from './validator-factory';

@Injectable()
export class ValidationService {
  private validatorFactory: ValidatorFactory;

  constructor() {
    this.validatorFactory = new ValidatorFactory();
  }

  private addValidatorToSchema(
    schema: any,
    validator: Validator,
    fieldName: string,
  ): void {
    const { factory, params } = validator;
    const customValidator = this.validatorFactory.getValidator(factory);

    if (customValidator) {
      schema.properties[fieldName] = customValidator.getValidator(params);
    } else {
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

  validate(
    data: any,
    manifest: TildaData,
  ): { errors: { path: string; message: string }[] } | null {
    const ajv = new Ajv({ allErrors: true });
    const generalSchema = this.generateSchemaFromManifest(manifest);

    const validate = ajv.compile(generalSchema);

    const isValid = validate(data);
    if (!isValid) {
      return {
        errors:
          validate.errors?.map((error) => ({
            path: error.schemaPath,
            message: error.message,
          })) || [],
      };
    }

    return null;
  }
}
