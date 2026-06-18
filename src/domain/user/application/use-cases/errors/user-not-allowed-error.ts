import { NotAllowedError } from '@/core/errors/not-allowed-error';

export class UserNotAllowedError extends NotAllowedError {
  constructor(
    message: string = 'User does not have permission to perform this action.',
  ) {
    super(message);
  }
}
