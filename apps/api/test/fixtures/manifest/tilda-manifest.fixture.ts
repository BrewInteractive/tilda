import {
  Constants,
  Field,
  Hook,
  HookType,
  TildaManifest,
} from '../../../src/models';

import { Mock } from 'mockingbird';
import { faker } from '@faker-js/faker';

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
  [Constants.emailSuffix]: string;
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
  static getEncryptedValidManifestHMAC() {
    return '44a98ec59c22d24b6b6a612b4acd90f68180237412e4c3e01dd1f913542dc9c4';
  }

  static getFirstRecipientEncryptedEmail() {
    return '24b5b244948a45caa4415a15:9283a0fdfbbb6e3a804fe5ebb938bfcf:872cc965688f2299bc67cd67105423c1';
  }

  static getWebhookSuccessPath() {
    return Constants.prefixPattern + 'response.success';
  }

  static getConstName1Value() {
    return 'const value';
  }

  static getConstName2EncValue() {
    return 'd2f9641add34ca1f65f20d38:efb52d71d555b6183b4eeaa8d21341:683dd0ae0f63f87f0a54d05d1563d5a7';
  }
  static getConstName2Value() {
    return 'encrypted value';
  }

  static getFirstRecipientEmail() {
    return 'example@mail.com';
  }

  static setInputNameForName() {
    return 'testName';
  }

  static getWebhookValues() {
    return {
      nameSurname:
        'Name: {' +
        Constants.prefixPattern +
        'fields.name.value} Surname: {' +
        Constants.prefixPattern +
        'fields.surname.value}',
      nameConstValue:
        '{' + Constants.prefixPattern + 'fields.name.const.constName1.value}',
      surnameConstEncValue:
        '{' +
        Constants.prefixPattern +
        'fields.surname.const.constName2.value}',
    };
  }
}
