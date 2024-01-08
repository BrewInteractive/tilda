import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidatorFactory } from './validator-factory';

@Module({
  providers: [
    ValidationService,
    {
      provide: 'ValidatorFactory',
      useValue: ValidatorFactory,
    },
  ],
})
export class ValidationModule {}
