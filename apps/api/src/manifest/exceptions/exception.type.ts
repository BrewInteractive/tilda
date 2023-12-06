import { ExceptionModel } from './exception.model';

export class ExceptionType {
  static readonly onlyOneProvided: ExceptionModel = {
    message: 'Only one of url or base64 should be provided',
    status: 400,
  };

  static readonly oneOfProvided: ExceptionModel = {
    message: 'One of url or base64 should be provided',
    status: 400,
  };

  static readonly errorFetchingURL: ExceptionModel = {
    message: 'Error fetching URL',
    status: 500,
  };

  static readonly errorDecodingBase64: ExceptionModel = {
    message: 'Error decoding base64',
    status: 500,
  };
}
