import { Mock } from 'mockingbird';
import { faker } from '@faker-js/faker';
import { Field, Hook, HookType, TildaManifest } from '../../../src/models';

class UiFixture {
  @Mock(() => faker.lorem.word())
  label: string;
}

class NameConstFixture {
  @Mock(() => faker.lorem.word())
  constName1: string;
}
class SurnameConstFixture {
  @Mock(() => faker.lorem.word())
  'constName2:enc': string;
}

class ValidatorsFixture {
  @Mock(() => 'alpha')
  factory: string;
}

class NameFixture {
  @Mock(() => '')
  inputName: string;

  @Mock(UiFixture)
  ui: UiFixture;

  @Mock(NameConstFixture)
  const: NameConstFixture;

  @Mock({ type: ValidatorsFixture, count: 1, required: false })
  validators: ValidatorsFixture[];
}

class SurnameFixture {
  @Mock(() => '')
  inputName: string;

  @Mock(UiFixture)
  ui: UiFixture;

  @Mock(SurnameConstFixture)
  const: SurnameConstFixture;

  @Mock({ type: ValidatorsFixture, count: 1, required: false })
  validators: ValidatorsFixture[];
}

class FieldsFixture {
  @Mock(NameFixture)
  name: NameFixture;
  @Mock(SurnameFixture)
  surname: SurnameFixture;
}

class PreHookParamsValuesFixture {
  @Mock(() => '')
  nameSurname: string;
}

class PreHookParamsFixture {
  @Mock(() => faker.internet.url())
  url: string;
  @Mock((faker) => faker.random.arrayElement(['POST', 'GET']))
  method: string;
  @Mock({ type: String, count: 1 })
  headers: string[];
  @Mock(PreHookParamsValuesFixture)
  values: PreHookParamsValuesFixture;
}

class PreHookFixture {
  @Mock(() => HookType.webhook)
  factory: string;
  @Mock(PreHookParamsFixture)
  params: PreHookParamsFixture;
}
class EmailPostHookRecipientsFixture {
  @Mock(() => faker.internet.email())
  'email:enc': string;
}
class PostHookParamsFixture {
  @Mock({ type: EmailPostHookRecipientsFixture, count: 1, required: false })
  recipients: EmailPostHookRecipientsFixture[];
}
class PostHookFixture {
  @Mock(() => HookType.email)
  factory: string;
  @Mock(PostHookParamsFixture)
  params: PostHookParamsFixture;
}

class HooksFixture {
  @Mock({ type: PreHookFixture, count: 1, required: false })
  pre: Hook[];
  @Mock({ type: PostHookFixture, count: 1, required: false })
  post: Hook[];
}

class DataFixture {
  @Mock(FieldsFixture)
  fields: { [key: string]: Field };
  @Mock(HooksFixture)
  hooks: HooksFixture;
}

export class TildaManifestFixture implements TildaManifest {
  @Mock(() => '')
  hmac: string;
  @Mock(DataFixture)
  data: DataFixture;
}
