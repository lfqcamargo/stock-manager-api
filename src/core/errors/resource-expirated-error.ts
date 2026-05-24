import { UseCaseError } from './use-case-error';

export class ResourceExpiratedError extends UseCaseError {
  message: string;

  constructor(message: string) {
    super('Resource Expirated Error');
    this.message = message;
  }
}
