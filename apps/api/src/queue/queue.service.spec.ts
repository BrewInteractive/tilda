import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import axios from 'axios';
import { PostHookRequestFixture } from '../../test/fixtures';
import { MockFactory } from 'mockingbird';
import { faker } from '@faker-js/faker';

jest.mock('axios');
const mockAxios = axios as jest.MockedFunction<typeof axios>;

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueService],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should send webhook successfully', async () => {
    const mockResponse = {
      data: faker.string.alpha(),
      status: 200,
    };
    mockAxios.mockResolvedValueOnce(mockResponse);
    const postHookRequest = MockFactory(PostHookRequestFixture).one();

    const result = await service.sendWebhookAsync(postHookRequest);

    expect(result).toEqual({ success: true });
  });

  it('should handle error during webhook send', async () => {
    mockAxios.mockRejectedValueOnce(new Error('ERROR'));
    const postHookRequest = MockFactory(PostHookRequestFixture).one();

    await expect(service.sendWebhookAsync(postHookRequest)).rejects.toThrow(
      'ERROR',
    );
  });
});
