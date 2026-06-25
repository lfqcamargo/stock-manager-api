import { ConflictError } from '@/core/errors/conflict-error';

export class AddressingActiveSystemError extends ConflictError {
  constructor(
    message: string = 'Cannot perform this action because there are active addressings linked to this item.',
  ) {
    super(message);
  }
}
