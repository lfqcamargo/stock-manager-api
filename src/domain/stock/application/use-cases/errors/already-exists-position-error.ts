import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsPositionError extends ConflictError {
  constructor() {
    super('Position already exists.');
  }
}
