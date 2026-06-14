import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class UserNotAdminError extends ResourceNotFoundError {
  constructor() {
    super('User not admin.');
  }
}
