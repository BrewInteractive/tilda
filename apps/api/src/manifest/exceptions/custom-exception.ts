import { HttpException } from '@nestjs/common';
import { ExceptionModel } from './exception.model';

export class CustomException extends HttpException {
  constructor(error: ExceptionModel) {
    super(error.message, error.status);
  }
}
