import { Mock } from 'mockingbird';

export class WebHookRequestFixture {
  @Mock((faker) => faker.internet.url())
  url: string;

  @Mock(['content-type: application/json'])
  headers: string[];

  @Mock((faker) => faker.lorem.word())
  method: string;

  @Mock({ type: Object, count: 1, required: false })
  values?: { [key: string]: string };
}
