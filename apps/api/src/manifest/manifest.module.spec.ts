import { Test } from '@nestjs/testing';
import { ManifestModule } from './manifest.module';
import { ConfigModule } from '@nestjs/config';

describe('Manifest Module Test', () => {
  let manifestModule: ManifestModule;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        ManifestModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    manifestModule = app.get<ManifestModule>(ManifestModule);
  });

  it('Should be defined', () => {
    expect(manifestModule).toBeDefined();
  });
});
