import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';
import { ValidationModule } from '../validation/validation.module';
import Ajv from 'ajv';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { HookModule } from '../hook/hook.module';
@Module({
  imports: [
    HttpModule,
    ValidationModule,
    HookModule,
    BullModule.registerQueue({
      name: 'hook-queue',
    }),
    BullBoardModule.forFeature({
      name: 'hook-queue',
      adapter: BullAdapter,
    }),
  ],
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
