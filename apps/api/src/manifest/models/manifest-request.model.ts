import { ApiProperty } from '@nestjs/swagger';
import { TildaManifest } from '../../models';

export class ManifestRequest {
  @ApiProperty()
  url?: string;
  @ApiProperty()
  base64?: string;
  @ApiProperty()
  manifest?: TildaManifest;
}
