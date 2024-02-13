import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { PostHookRequestFixture } from '../../test/fixtures';
import { MockFactory } from 'mockingbird';
import { faker } from '@faker-js/faker';
import { HookService } from './hook.service';

jest.mock('axios');
const mockAxios = axios as jest.MockedFunction<typeof axios>;

describe('HookService', () => {
  let queueService: HookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HookService],
    }).compile();

    queueService = module.get<HookService>(HookService);
  });

  it('should send webhook successfully', async () => {
    const mockResponse = {
      data: faker.string.alpha(),
      status: 200,
    };
    mockAxios.mockResolvedValueOnce(mockResponse);
    const postHookRequest = MockFactory(PostHookRequestFixture).one();

    const result = await queueService.sendWebhookAsync(postHookRequest);

    expect(result).toEqual({ success: true });
  });

  it('should handle error during webhook send', async () => {
    mockAxios.mockRejectedValueOnce(new Error('ERROR'));
    const postHookRequest = MockFactory(PostHookRequestFixture).one();

    await expect(
      queueService.sendWebhookAsync(postHookRequest),
    ).rejects.toThrow('ERROR');
  });
});
