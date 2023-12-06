import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ManifestService } from './manifest/manifest.service';

@Module({
  imports: [],
  controllers: [ApiController],
  providers: [ApiService, ManifestService],
})
export class ApiModule {}
