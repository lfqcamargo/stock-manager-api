import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class PositionNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Position not found.');
  }
}
