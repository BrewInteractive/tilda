import { Test, TestingModule } from '@nestjs/testing';

import { EmailProcessor } from '../hook/email.processor';
import { EmailRequest } from '../hook/models';
import { Hook } from '../models';
import { HookProcessorFactory } from '../hook/hook.factory';
import { HookQueue } from './hook.queue';
import { HookService } from '../hook/hook.service';
import { MockFactory } from 'mockingbird';
import { WebHookRequestFixture } from '../../test/fixtures';
import { WebhookProcessor } from '../hook/webhook.processor';
import { faker } from '@faker-js/faker';

describe('HookQueue', () => {
  let hookQueue: HookQueue;
  let hookServiceMock: Partial<HookService>;
  let hookProcessorFactoryMock: HookProcessorFactory;
  let emailProcessorMock: EmailProcessor;
  let webHookProcessorMock: WebhookProcessor;

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
        {
          provide: HookProcessorFactory,
          useValue: {
            getProcessor: jest.fn(),
          },
        },
        {
          provide: EmailProcessor,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: WebhookProcessor,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    hookQueue = module.get<HookQueue>(HookQueue);
    hookProcessorFactoryMock =
      module.get<HookProcessorFactory>(HookProcessorFactory);
    emailProcessorMock = module.get<EmailProcessor>(EmailProcessor);
    webHookProcessorMock = module.get<WebhookProcessor>(WebhookProcessor);
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
    } as { data: { hook: Hook } };

    jest
      .spyOn(hookProcessorFactoryMock, 'getProcessor')
      .mockReturnValueOnce(emailProcessorMock);

    await hookQueue.processHook(job);

    expect(emailProcessorMock.execute).toHaveBeenCalledWith(
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
    } as { data: { hook: Hook } };

    jest
      .spyOn(hookProcessorFactoryMock, 'getProcessor')
      .mockReturnValueOnce(emailProcessorMock);

    await hookQueue.processHook(job);

    expect(emailProcessorMock.execute).toHaveBeenCalledWith(
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
    } as { data: { hook: Hook } };

    jest
      .spyOn(hookProcessorFactoryMock, 'getProcessor')
      .mockReturnValueOnce(webHookProcessorMock);

    await hookQueue.processHook(job);

    expect(webHookProcessorMock.execute).toHaveBeenCalledWith(
      job.data.hook.params,
    );
  });

  it('should throw error with wrong factory and params', async () => {
    const job = {
      data: {
        hook: {
          factory: 'wrong-factory',
          params: {},
        },
      },
    } as any;

    jest
      .spyOn(hookProcessorFactoryMock, 'getProcessor')
      .mockImplementationOnce(() => {
        throw new Error(`Unsupported hook type: ${job.data.hook.factory}`);
      });

    await expect(hookQueue.processHook(job)).rejects.toThrow(
      `Unsupported hook type: ${job.data.hook.factory}`,
    );
  });
});
