import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidUnitMeasureError extends UseCaseError {
  message: string;

  constructor() {
    super('Invalid unit measure Error');
    this.message = 'Invalid unit measure.';
  }
}
