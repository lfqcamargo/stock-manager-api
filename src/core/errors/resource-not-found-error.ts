import { UseCaseError } from './use-case-error';

export class ResourceNotFoundError extends UseCaseError {
  message: string;

  constructor(message: string) {
    super('Resource not found Error');
    this.message = message;
  }
}
