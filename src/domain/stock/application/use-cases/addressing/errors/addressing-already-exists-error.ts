import { ConflictError } from '@/core/errors/conflict-error';

export class AddressingAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      'An addressing for this location / sub-location / row / shelf / position already exists.',
    );
  }
}
