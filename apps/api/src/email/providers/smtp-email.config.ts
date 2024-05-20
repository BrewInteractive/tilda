import { EmailConfig } from './email.config';
export class SmtpEmailConfig implements EmailConfig {
  from: string;
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user?: string;
    pass?: string;
  };
}
