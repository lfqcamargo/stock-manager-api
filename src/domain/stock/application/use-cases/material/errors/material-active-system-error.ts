import { ConflictError } from '@/core/errors/conflict-error';

export class MaterialActiveSystemError extends ConflictError {
  constructor(
    message: string = 'Cannot perform this action because there are active materials linked to this item.',
  ) {
    super(message);
  }
}
