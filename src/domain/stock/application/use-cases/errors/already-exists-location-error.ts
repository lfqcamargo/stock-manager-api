import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsLocationError extends ConflictError {
  constructor() {
    super('Location already exists.');
  }
}
