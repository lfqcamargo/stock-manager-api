import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidCsvFormatError extends UseCaseError {
  message: string;

  constructor(details: string) {
    super('Invalid CSV format');
    this.message = `Invalid CSV format: ${details}`;
  }
}
