import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsGroupError extends ConflictError {
  constructor(field?: string) {
    super(field ? `${field} already exists.` : 'Group already exists.');
  }
}
