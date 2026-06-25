import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class SubLocationNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('SubLocation not found.');
  }
}
