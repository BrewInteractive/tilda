import { Hook, HookType } from '../../../src/models';

import { Mock } from 'mockingbird';
import { WebHookRequestFixture } from '../hook/web-hook-request.fixture';
import { faker } from '@faker-js/faker';

class EmailRequestFixture {
  @Mock({
    type: Array,
    count: 1,
    of: {
      'email:enc': faker.internet.email(),
    },
  })
  recipients: Array<{ 'email:enc': string }>;
}

export class WebHookFixture implements Hook {
  @Mock(() => HookType.webhook)
  factory: HookType;

  @Mock(WebHookRequestFixture)
  params: WebHookRequestFixture;
}

export class EmailHookFixture implements Hook {
  @Mock(() => HookType.email)
  factory: HookType;

  @Mock(EmailRequestFixture)
  params: EmailRequestFixture;
}
