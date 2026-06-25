import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsRowError extends ConflictError {
  constructor() {
    super('Row already exists.');
  }
}
