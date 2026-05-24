import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class UserNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('User not found.');
  }
}
