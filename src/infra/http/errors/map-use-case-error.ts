import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ConflictError } from '@/core/errors/conflict-error';
import { ResourceExpiratedError } from '@/core/errors/resource-expirated-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UseCaseError } from '@/core/errors/use-case-error';
import { WrongCredentialsError } from '@/core/errors/wrong-credentials-error';

export function mapUseCaseErrorToHttpException(error: UseCaseError) {
  if (error instanceof ConflictError) {
    return new ConflictException(error.message);
  }

  if (
    error instanceof ResourceExpiratedError ||
    error instanceof WrongCredentialsError
  ) {
    return new BadRequestException(error.message);
  }

  if (error instanceof ResourceNotFoundError) {
    return new NotFoundException(error.message);
  }

  return new InternalServerErrorException(error.error ?? 'Bad request');
}
