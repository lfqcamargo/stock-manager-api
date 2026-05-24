import { WrongCredentialsError } from '@/core/errors/wrong-credentials-error';

export class CredentialsError extends WrongCredentialsError {
  constructor() {
    super(`Credentials are not valid.`);
  }
}
