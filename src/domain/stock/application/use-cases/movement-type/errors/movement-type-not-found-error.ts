import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class MovementTypeNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Movement type not found.');
  }
}
