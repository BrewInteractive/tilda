import { EmailRecipient, HookParams } from '.';

export interface EmailParams extends HookParams {
  recipients: EmailRecipient[];
}
