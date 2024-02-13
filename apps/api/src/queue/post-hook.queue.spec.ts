import { Test, TestingModule } from '@nestjs/testing';
import { PostHookQueue } from './post-hook.queue';
import { MockFactory } from 'mockingbird';
import { PostHookRequestFixture } from '../../test/fixtures';
import { HookService } from '../hook/hook.service';

jest.mock('../hook/hook.service');

describe('PostHookQueue', () => {
  let postHookQueue: PostHookQueue;
  let hookService: HookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostHookQueue, HookService],
    }).compile();

    postHookQueue = module.get<PostHookQueue>(PostHookQueue);
    hookService = module.get<HookService>(HookService);
  });

  describe('processPostHook', () => {
    it('should call sendWebhookAsync with job data', async () => {
      const postHookRequest = MockFactory(PostHookRequestFixture).one();

      await postHookQueue.processPostHook({ data: postHookRequest });

      expect(hookService.sendWebhookAsync).toHaveBeenCalledWith(
        postHookRequest,
      );
    });
  });
});
