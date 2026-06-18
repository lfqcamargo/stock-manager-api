import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsMaterialError extends ConflictError {
  constructor(field?: string) {
    super(field ? `${field} already exists.` : 'Material already exists.');
  }
}
