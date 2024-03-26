import { DataWithUiLabels } from '../../models';

export class EmailRequest {
  recipients: Recipient[];
  dataWithUi?: DataWithUiLabels;
}

class Recipient {
  'email:enc': string;
}
