import { ConflictError } from '@/core/errors/conflict-error';

export class AlreadyExistsCnpjError extends ConflictError {
  constructor() {
    super('Cnpj already exists.');
  }
}
