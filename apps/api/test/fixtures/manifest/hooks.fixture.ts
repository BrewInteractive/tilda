import { HookType } from '../../../src/models/hooks/hook-type.enum';
import { Mock } from 'mockingbird';
import { Hook } from '../../../src/models/hooks/';
import { faker } from '@faker-js/faker';

class WebhookRequestFixture {
  @Mock((faker) => faker.internet.url())
  url: string;

  @Mock({ type: Object, count: 1, required: true })
  headers: string[];

  @Mock((faker) => faker.lorem.word())
  method: string;

  @Mock({ type: Object, count: 1, required: false })
  values: { [key: string]: string };
}

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

  @Mock(WebhookRequestFixture)
  params: WebhookRequestFixture;
}

export class EmailHookFixture implements Hook {
  @Mock(() => HookType.email)
  factory: HookType;

  @Mock(EmailRequestFixture)
  params: EmailRequestFixture;
}
