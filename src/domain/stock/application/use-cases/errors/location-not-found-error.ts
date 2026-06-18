import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class LocationNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Location not found.');
  }
}
