import { Test, TestingModule } from '@nestjs/testing';
import { HookQueue } from './hook.queue';
import { HookService } from '../hook/hook.service';
import { WebHookRequestFixture } from '../../test/fixtures';
import { MockFactory } from 'mockingbird';
import { faker } from '@faker-js/faker';

describe('HookQueue', () => {
  let hookQueue: HookQueue;
  let hookServiceMock: Partial<HookService>;

  beforeEach(async () => {
    hookServiceMock = {
      sendEmailAsync: jest.fn(),
      sendWebhookAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HookQueue,
        {
          provide: HookService,
          useValue: hookServiceMock,
        },
      ],
    }).compile();

    hookQueue = module.get<HookQueue>(HookQueue);
  });

  it('should process email hook with correct factory and params', async () => {
    const job = {
      data: {
        factory: 'email',
        params: {
          recipients: [
            {
              'email:enc': faker.internet.email(),
            },
          ],
        },
      },
    };

    await hookQueue.processHook(job);

    expect(hookServiceMock.sendEmailAsync).toHaveBeenCalledWith(
      job.data.params,
    );
  });

  it('should process webhook hook with correct factory and params', async () => {
    const webHookParams = MockFactory(WebHookRequestFixture).one();

    const job = {
      data: {
        factory: 'webhook',
        params: {
          ...webHookParams,
        },
      },
    };

    await hookQueue.processHook(job);

    expect(hookServiceMock.sendWebhookAsync).toHaveBeenCalledWith(
      job.data.params,
    );
  });

  it('should process webhook hook with wrong factory and params', async () => {
    const job = {
      data: {
        factory: 'wrong-factory',
        params: {},
      },
    };

    await expect(hookQueue.processHook(job)).rejects.toThrow(
      `Unsupported hook type: ${job.data.factory}`,
    );
  });
});
