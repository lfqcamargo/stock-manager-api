import { UseCaseError } from './use-case-error';

export class NotAllowedError extends UseCaseError {
  message: string;

  constructor(message: string) {
    super('Not Allowed Error');
    this.message = message;
  }
}
