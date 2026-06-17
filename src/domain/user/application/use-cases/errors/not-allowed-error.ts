import { NotAllowedError as CoreNotAllowedError } from '@/core/errors/not-allowed-error';

export class NotAllowedError extends CoreNotAllowedError {
  constructor() {
    super('Not allowed to perform this action.');
  }
}
