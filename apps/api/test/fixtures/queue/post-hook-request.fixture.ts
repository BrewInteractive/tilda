import { Mock } from 'mockingbird';

export class PostHookRequestFixture {
  @Mock((faker) => faker.internet.url())
  url: string;

  @Mock({ type: Object, count: 1, required: false })
  headers?: { [key: string]: string };

  @Mock((faker) => faker.lorem.word())
  method: string;

  @Mock({ type: Object, count: 1, required: false })
  values?: { [key: string]: string };
}
