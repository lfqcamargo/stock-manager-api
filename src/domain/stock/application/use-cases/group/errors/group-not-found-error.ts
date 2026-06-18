import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

export class GroupNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Group not found.');
  }
}
