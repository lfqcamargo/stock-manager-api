import { ConflictError } from '@/core/errors/conflict-error';

export class AddressingHasBalanceError extends ConflictError {
  constructor(
    message: string = 'Cannot perform this action because there are addressings with balance linked to this item.',
  ) {
    super(message);
  }
}
