import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class AddressingNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Addressing not found.');
  }
}
