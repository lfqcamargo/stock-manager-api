import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsMovementTypeError extends ConflictError {
  constructor() {
    super('Movement type already exists.');
  }
}
