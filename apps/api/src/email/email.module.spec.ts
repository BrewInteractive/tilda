import { ConfigurationFixture } from '../../test/fixtures/';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email.module';
import { MockFactory } from 'mockingbird';
import { Test } from '@nestjs/testing';

describe('EmailModule', () => {
  let emailModule: EmailModule;

  it('Should be defined', async () => {
    const mockConfig = MockFactory(ConfigurationFixture).one();
    const app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => mockConfig],
        }),
        EmailModule,
      ],
    }).compile();

    emailModule = app.get<EmailModule>(EmailModule);
    expect(emailModule).toBeDefined();
  });

  it('Should throw error', async () => {
    const expectedError = new Error('Invalid email service type');
    process.env.EMAIL_SERVICE = 'invalid';

    await expect(
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [() => ({})],
          }),
          EmailModule,
        ],
      }).compile(),
    ).rejects.toThrow(expectedError);
  });
});
