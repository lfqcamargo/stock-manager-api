import { ResourceExpiratedError } from '@/core/errors/resource-expirated-error';

export class TokenExpiratedError extends ResourceExpiratedError {
  constructor() {
    super('Token expirated.');
  }
}
