import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailQueue } from './send-email.queue';
import { QueueService } from './queue.service';
import { faker } from '@faker-js/faker';

jest.mock('./queue.service');

describe('SendEmailQueue', () => {
  let sendEmailQueue: SendEmailQueue;
  let queueService: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendEmailQueue, QueueService],
    }).compile();

    sendEmailQueue = module.get<SendEmailQueue>(SendEmailQueue);
    queueService = module.get<QueueService>(QueueService);
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

      expect(queueService.sendEmailAsync).toHaveBeenCalledWith(jobData);
    });
  });
});
