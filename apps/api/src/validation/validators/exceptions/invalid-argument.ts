export class InvalidArgumentException extends Error {
  constructor() {
    super(`Required parameters are missing or invalid.`);
  }
}
