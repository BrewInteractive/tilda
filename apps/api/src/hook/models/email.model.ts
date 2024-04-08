import { Constants, DataWithUiLabels } from '../../models';

export class EmailRequest {
  recipients: Recipient[];
  dataWithUi?: DataWithUiLabels;
}

class Recipient {
  [Constants.emailSuffix]: string;
}
