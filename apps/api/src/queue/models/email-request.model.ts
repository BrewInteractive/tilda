export class EmailRequest {
  recipients: Recipient[];
}

class Recipient {
  'email:enc': string;
}
