import { ConfigService } from '@nestjs/config';
import { DataCordProcessor } from './datacord.processor';
import { EmailProcessor } from './email.processor';
import { HookProcessorFactory } from './hook.factory';
import { HookService } from './hook.service';
import { HookType } from '../models';
import { HttpService } from '@nestjs/axios';
import { ModuleRef } from '@nestjs/core';
import { SmtpEmailConfig } from '../email/providers/smtp-email.config';
import { SmtpEmailService } from '../email/providers/smtp-email.service';
import { Test } from '@nestjs/testing';
import { WebhookProcessor } from './webhook.processor';
import { faker } from '@faker-js/faker';

describe('HookProcessorFactory', () => {
  let moduleRef: ModuleRef;
  let factory: HookProcessorFactory;
  let emailProcessor: EmailProcessor;
  let dataCordProcessor: DataCordProcessor;
  let webhookProcessor: WebhookProcessor;

  beforeEach(async () => {
    const hookServiceMock = {
      sendEmailAsync: jest.fn(),
      sendWebhookAsync: jest.fn(),
    };
    const config = {
      host: faker.internet.url(),
      port: faker.number.int(),
      secure: faker.datatype.boolean(),
      auth: {
        user: faker.internet.email(),
        pass: faker.internet.password(),
      },
    } as SmtpEmailConfig;
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            get: jest.fn().mockImplementation((_: string) => {
              return 'SMTP';
            }),
          },
        },
        {
          provide: SmtpEmailConfig,
          useValue: config,
        },
        {
          provide: HookService,
          useValue: hookServiceMock,
        },
        {
          provide: HttpService,
          useValue: {},
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
          provide: DataCordProcessor,
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
        {
          provide: SmtpEmailService,
          useValue: {
            sendEmailAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    moduleRef = module.get<ModuleRef>(ModuleRef);
    emailProcessor = module.get<EmailProcessor>(EmailProcessor);
    webhookProcessor = module.get<WebhookProcessor>(WebhookProcessor);
    dataCordProcessor = module.get<DataCordProcessor>(DataCordProcessor);
    factory = new HookProcessorFactory(moduleRef);
  });

  it('should return an instance of EmailProcessor for HookType.email', () => {
    jest.spyOn(moduleRef, 'get').mockImplementation(() => emailProcessor);

    const processor = factory.getProcessor(HookType.email);
    expect(processor).toBe(emailProcessor);
  });

  it('should return an instance of WebhookProcessor for HookType.webhook', () => {
    jest.spyOn(moduleRef, 'get').mockImplementation(() => webhookProcessor);

    const processor = factory.getProcessor(HookType.webhook);
    expect(processor).toBe(webhookProcessor);
  });

  it('should return an instance of DataCordProcesser for HookType.datacord', () => {
    jest.spyOn(moduleRef, 'get').mockImplementation(() => dataCordProcessor);

    const processor = factory.getProcessor(HookType.datacord);
    expect(processor).toBe(dataCordProcessor);
  });

  it('should throw an error for unsupported hook types', () => {
    try {
      factory.getProcessor('invalidHookType' as HookType);
    } catch (error) {
      expect(error).toEqual(
        new Error('Unsupported hook type: invalidHookType'),
      );
    }
  });
});
