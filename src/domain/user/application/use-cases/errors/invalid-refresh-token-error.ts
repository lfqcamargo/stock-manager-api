import { WrongCredentialsError } from '@/core/errors/wrong-credentials-error';

export class InvalidRefreshTokenError extends WrongCredentialsError {
  constructor() {
    super('Invalid or expired refresh token.');
  }
}
