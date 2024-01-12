import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidatorFactory } from './validator-factory';
import Ajv from 'ajv';

@Module({
  providers: [
    ValidationService,
    {
      provide: 'ValidatorFactory',
      useValue: new ValidatorFactory(),
    },
    {
      provide: 'Ajv',
      useValue: new Ajv({ allErrors: true }),
    },
  ],
  exports: [ValidationService, 'ValidatorFactory'],
})
export class ValidationModule {}
