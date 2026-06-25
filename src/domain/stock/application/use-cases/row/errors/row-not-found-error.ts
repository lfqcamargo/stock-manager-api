import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class RowNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Row not found.');
  }
}
