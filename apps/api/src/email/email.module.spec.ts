import { EmailModule } from './email.module';
import { Test } from '@nestjs/testing';

describe('EmailModule', () => {
  let emailModule: EmailModule;

  it('Should be defined', async () => {
    const app = await Test.createTestingModule({
      imports: [
        EmailModule,
      ],
    }).compile();

    emailModule = app.get<EmailModule>(EmailModule);
    expect(emailModule).toBeDefined();
  });
});
