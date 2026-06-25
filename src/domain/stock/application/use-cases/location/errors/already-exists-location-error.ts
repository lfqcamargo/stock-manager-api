import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsLocationError extends ConflictError {
  constructor(field?: string) {
    super(field ? `${field} already exists.` : 'Location already exists.');
  }
}
