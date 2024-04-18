import { Constants, Hook, HookType } from '../../../src/models';

import { Mock } from 'mockingbird';
import { WebHookRequestFixture } from '../hook/web-hook-request.fixture';
import { faker } from '@faker-js/faker';

class EmailRequestFixture {
  @Mock({
    type: Array,
    count: 1,
    of: {
      [Constants.emailSuffix]: faker.internet.email(),
    },
  })
  recipients: Array<{ [Constants.emailSuffix]: string }>;
}

export class WebHookFixture implements Hook {
  @Mock(faker.string.uuid)
  id: string;

  @Mock(() => HookType.webhook)
  factory: HookType;

  @Mock(WebHookRequestFixture)
  params: WebHookRequestFixture;
}

export class EmailHookFixture implements Hook {
  @Mock(faker.string.uuid)
  id: string;

  @Mock(() => HookType.email)
  factory: HookType;

  @Mock(EmailRequestFixture)
  params: EmailRequestFixture;
}
