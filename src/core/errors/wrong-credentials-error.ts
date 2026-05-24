import { UseCaseError } from './use-case-error';

export class WrongCredentialsError extends UseCaseError {
  message: string;

  constructor(message: string) {
    super('Wrong credentials Error');
    this.message = message;
  }
}
