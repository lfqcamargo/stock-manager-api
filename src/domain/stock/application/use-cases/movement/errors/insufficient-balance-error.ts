import { ConflictError } from '@/core/errors/conflict-error';

export class InsufficientBalanceError extends ConflictError {
  constructor() {
    super('Insufficient balance for this movement.');
  }
}
