import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class MaterialNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Material not found.');
  }
}
