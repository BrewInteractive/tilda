import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailQueue } from './send-email.queue';
import { HookService } from '../hook/hook.service';
import { faker } from '@faker-js/faker';

jest.mock('../hook/hook.service');

describe('SendEmailQueue', () => {
  let sendEmailQueue: SendEmailQueue;
  let hookService: HookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendEmailQueue, HookService],
    }).compile();

    sendEmailQueue = module.get<SendEmailQueue>(SendEmailQueue);
    hookService = module.get<HookService>(HookService);
  });

  describe('processSendEmail', () => {
    it('should call sendEmailAsync with job data', async () => {
      const jobData = {
        recipients: [
          {
            'email:enc': faker.internet.email(),
          },
        ],
      };

      await sendEmailQueue.processSendEmail({ data: jobData });

      expect(hookService.sendEmailAsync).toHaveBeenCalledWith(jobData);
    });
  });
});
