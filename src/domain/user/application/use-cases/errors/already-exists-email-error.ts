import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsEmailError extends ConflictError {
  constructor() {
    super('Email already exists.');
  }
}
