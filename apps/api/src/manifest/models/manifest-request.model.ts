import { ApiProperty } from '@nestjs/swagger';

export class ManifestRequest {
  @ApiProperty()
  url?: string;
  @ApiProperty()
  base64?: string;
}
