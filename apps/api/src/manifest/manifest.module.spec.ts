import { Test } from '@nestjs/testing';
import { ManifestModule } from './manifest.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationFixture } from '../../test/fixtures';
import { MockFactory } from 'mockingbird';
import { QueueModule } from '../queue/queue.module';

describe('Manifest Module Test', () => {
  let manifestModule: ManifestModule;

  beforeEach(async () => {
    const mockConfig = MockFactory(ConfigurationFixture).one();

    const app = await Test.createTestingModule({
      imports: [
        QueueModule,
        ManifestModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => mockConfig],
        }),
      ],
    }).compile();

    manifestModule = app.get<ManifestModule>(ManifestModule);
  });

  it('Should be defined', () => {
    expect(manifestModule).toBeDefined();
  });
});
