import { NotAllowedError } from '@/core/errors/not-allowed-error';

export class UserNotAdminError extends NotAllowedError {
  constructor() {
    super('User must be an admin to perform this action.');
  }
}
