import { Test, TestingModule } from '@nestjs/testing';
import { PostHookQueue } from './post-hook.queue';
import { QueueService } from './queue.service';
import { MockFactory } from 'mockingbird';
import { PostHookRequestFixture } from '../../test/fixtures';

jest.mock('./queue.service');

describe('PostHookQueue', () => {
  let postHookQueue: PostHookQueue;
  let queueService: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostHookQueue, QueueService],
    }).compile();

    postHookQueue = module.get<PostHookQueue>(PostHookQueue);
    queueService = module.get<QueueService>(QueueService);
  });

  describe('processPostHook', () => {
    it('should call sendWebhookAsync with job data', async () => {
      const postHookRequest = MockFactory(PostHookRequestFixture).one();

      await postHookQueue.processPostHook({ data: postHookRequest });

      expect(queueService.sendWebhookAsync).toHaveBeenCalledWith(
        postHookRequest,
      );
    });
  });
});
