import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';
import { ValidationModule } from '../validation/validation.module';
import Ajv from 'ajv';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
@Module({
  imports: [
    HttpModule,
    ValidationModule,
    BullModule.registerQueue(
      {
        name: 'post-hook',
      },
      {
        name: 'send-email',
      },
    ),
    BullBoardModule.forFeature(
      {
        name: 'post-hook',
        adapter: BullAdapter,
      },
      {
        name: 'send-email',
        adapter: BullAdapter,
      },
    ),
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
