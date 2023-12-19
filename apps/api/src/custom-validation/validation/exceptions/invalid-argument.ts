import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidArgumentException extends HttpException {
  constructor() {
    super(
      `Required parameters are missing or invalid.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
