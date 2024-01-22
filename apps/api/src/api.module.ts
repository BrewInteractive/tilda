import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ManifestModule } from './manifest/manifest.module';
import { ConfigModule } from '@nestjs/config';
import { ValidationModule } from './validation/validation.module';
import config from '../src/config/configuration';
import { BullQueueModule } from './queue/bull.module';

@Module({
  imports: [
    ManifestModule,
    BullQueueModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ValidationModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
