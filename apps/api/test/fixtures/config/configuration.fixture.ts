import { EmailServiceType } from '../../../src/email/enum/email.service.type.enum';
import { Mock } from 'mockingbird';

export class ConfigurationFixture {
  @Mock(EmailServiceType.SMTP)
  EMAIL_SERVICE: string;
}
