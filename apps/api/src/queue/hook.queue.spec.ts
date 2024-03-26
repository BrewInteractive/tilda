import { Test, TestingModule } from '@nestjs/testing';

import { EmailRequest } from '../hook/models';
import { HookQueue } from './hook.queue';
import { HookService } from '../hook/hook.service';
import { MockFactory } from 'mockingbird';
import { WebHookRequestFixture } from '../../test/fixtures';
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
        hook: {
          factory: 'email',
          params: {
            recipients: [
              {
                'email:enc': faker.internet.email(),
              },
            ],
          } as EmailRequest,
        },
      },
    };

    await hookQueue.processHook(job);

    expect(hookServiceMock.sendEmailAsync).toHaveBeenCalledWith(
      job.data.hook.params,
    );
  });

  it('should process email hook with correct factory and params with ui labels', async () => {
    const job = {
      data: {
        hook: {
          factory: 'email',
          params: {
            recipients: [
              {
                'email:enc': faker.internet.email(),
              },
            ],
            dataWithUi: {
              name: faker.person.firstName(),

              surname: faker.person.lastName(),
            },
          },
        },
      },
    };

    await hookQueue.processHook(job);

    expect(hookServiceMock.sendEmailAsync).toHaveBeenCalledWith(
      job.data.hook.params,
    );
  });
  it('should process webhook hook with correct factory and params', async () => {
    const webHookParams = MockFactory(WebHookRequestFixture).one();

    const job = {
      data: {
        hook: {
          factory: 'webhook',
          params: {
            ...webHookParams,
          },
        },
      },
    };

    await hookQueue.processHook(job);

    expect(hookServiceMock.sendWebhookAsync).toHaveBeenCalledWith(
      job.data.hook.params,
    );
  });

  it('should process webhook hook with wrong factory and params', async () => {
    const job = {
      data: {
        hook: {
          factory: 'wrong-factory',
          params: {},
        },
      },
    };

    await expect(hookQueue.processHook(job)).rejects.toThrow(
      `Unsupported hook type: ${job.data.hook.factory}`,
    );
  });
});
