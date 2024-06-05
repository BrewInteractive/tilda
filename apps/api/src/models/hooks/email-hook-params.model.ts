import { DataWithUiLabels, EmailRecipient, HookParams } from '.';

import { EmailConfig } from '../../email/providers/email.config';
import { EmailServiceType } from '../../email/enum/email.service.type.enum';

export interface EmailParams extends HookParams {
  recipients: EmailRecipient[];
  serviceType: EmailServiceType;
  subject?: string;
  config: EmailConfig;
  dataWithUi?: DataWithUiLabels;
}
