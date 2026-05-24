import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class ResourceTokenNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Resource token not found.');
  }
}
