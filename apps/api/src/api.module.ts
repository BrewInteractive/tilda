import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ManifestModule } from './manifest/manifest.module';

@Module({
  imports: [ManifestModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
