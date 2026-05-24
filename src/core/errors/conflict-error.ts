import { UseCaseError } from './use-case-error';

export class ConflictError extends UseCaseError {
  message: string;

  constructor(message: string) {
    super('Conflict Error');
    this.message = message;
  }
}
