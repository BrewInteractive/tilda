import { Enum } from './../../../src/validation/validators/enum';
import { Mock } from 'mockingbird';
import { WebhookHttpMethod } from '../../../src/models';
import { WebhookParams } from '../../../src/models/hooks/web-hook-params.model';

export class WebHookRequestFixture implements WebhookParams {
  @Mock((faker) => faker.internet.url())
  url: string;

  @Mock(['content-type: application/json'])
  headers: string[];

  @Mock((faker) => faker.helpers.randomize(Object.values(WebhookHttpMethod)))
  method: WebhookHttpMethod;

  @Mock({ type: Object, count: 1, required: false })
  values?: { [key: string]: string };
}
