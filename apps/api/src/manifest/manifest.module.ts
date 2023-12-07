import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ManifestService } from './manifest.service';

@Module({
  imports: [HttpModule],
  providers: [ManifestService],
})
export class ManifestModule {}
