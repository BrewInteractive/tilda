export class Email {
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html: string;
}
