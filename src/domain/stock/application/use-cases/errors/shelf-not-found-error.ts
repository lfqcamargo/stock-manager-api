import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class ShelfNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Shelf not found.');
  }
}
