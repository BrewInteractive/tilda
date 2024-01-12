import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';
import { ValidationModule } from '../validation/validation.module';
import Ajv from 'ajv';

@Module({
  imports: [HttpModule, ValidationModule],
  providers: [
    ManifestService,
    {
      provide: 'Ajv',
      useValue: new Ajv({ allErrors: true }),
    },
  ],
  controllers: [ManifestController],
})
export class ManifestModule {}
