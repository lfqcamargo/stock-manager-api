import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidImportModeError extends UseCaseError {
  message: string;

  constructor() {
    super('Invalid import mode');
    this.message =
      'Invalid import mode. Accepted values: ADD_NEW, UPDATE_EXISTING, RESET.';
  }
}
