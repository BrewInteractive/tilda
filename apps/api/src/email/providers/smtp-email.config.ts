import { EmailConfig } from './email.config';
export class SmtpEmailConfig implements EmailConfig {
  from: string;
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  [key: string]: any;
}
