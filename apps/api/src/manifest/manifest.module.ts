import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ManifestService } from './manifest.service';
import { ManifestController } from './manifest.controller';

@Module({
  imports: [HttpModule],
  providers: [ManifestService],
  controllers: [ManifestController],
})
export class ManifestModule {}
