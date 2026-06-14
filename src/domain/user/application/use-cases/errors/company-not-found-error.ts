import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class CompanyNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Company not found.');
  }
}
