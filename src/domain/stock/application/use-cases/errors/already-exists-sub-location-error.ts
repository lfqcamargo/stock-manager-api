import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsSubLocationError extends ConflictError {
  constructor() {
    super('SubLocation already exists.');
  }
}
