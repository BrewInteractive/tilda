import { Test, TestingModule } from '@nestjs/testing';
import { QueueModule } from './queue.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';
import { MockFactory } from 'mockingbird';
import { ConfigurationFixture } from '../../test/fixtures';

describe('QueueModule', () => {
  let module: TestingModule;
  const mockConfig = MockFactory(ConfigurationFixture).one();

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        QueueModule,
        EmailModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => mockConfig],
        }),
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
