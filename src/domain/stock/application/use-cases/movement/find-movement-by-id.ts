import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Movement } from '../../../enterprise/entities/movement';
import { MovementsRepository } from '../../repositories/movements-repository';
import { MovementNotFoundError } from './errors/movement-not-found-error';

interface FindMovementByIdUseCaseRequest {
  authenticateId: string;
  movementId: string;
}

type FindMovementByIdUseCaseResponse = Either<
  UserNotFoundError | MovementNotFoundError,
  { movement: Movement }
>;

@Injectable()
export class FindMovementByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementsRepository: MovementsRepository,
  ) {}

  async execute({
    authenticateId,
    movementId,
  }: FindMovementByIdUseCaseRequest): Promise<FindMovementByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const movement = await this._movementsRepository.findById(movementId);
    if (
      !movement ||
      movement.companyId.toString() !== user.companyId.toString()
    )
      return left(new MovementNotFoundError());

    return right({ movement });
  }
}
