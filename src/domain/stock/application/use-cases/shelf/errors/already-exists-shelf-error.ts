import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsShelfError extends ConflictError {
  constructor() {
    super('Shelf already exists.');
  }
}
