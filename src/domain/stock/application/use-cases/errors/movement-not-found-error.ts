import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class MovementNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Movement not found.');
  }
}
