import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ManifestModule } from './manifest/manifest.module';
import { ConfigModule } from '@nestjs/config';
import { ValidationModule } from './validation/validation.module';
import config from '../src/config/configuration';
import { QueueModule } from './queue/queue.module';
import { HookService } from './hook/hook.service';
import { HookModule } from './hook/hook.module';

@Module({
  imports: [
    ManifestModule,
    QueueModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ValidationModule,
    HookModule,
  ],
  controllers: [ApiController],
  providers: [ApiService, HookService],
})
export class ApiModule {}
