import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class UserNotBelongToCompanyError extends ResourceNotFoundError {
  constructor() {
    super('User not belong to company.');
  }
}
