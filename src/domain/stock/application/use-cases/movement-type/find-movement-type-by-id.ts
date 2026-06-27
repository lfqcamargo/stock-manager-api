import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { MovementType } from '../../../enterprise/entities/movement-type';
import { MovementTypesRepository } from '../../repositories/movement-types-repository';
import { MovementTypeNotFoundError } from './errors/movement-type-not-found-error';

interface FindMovementTypeByIdUseCaseRequest {
  authenticateId: string;
  movementTypeId: string;
}

type FindMovementTypeByIdUseCaseResponse = Either<
  UserNotFoundError | MovementTypeNotFoundError,
  { movementType: MovementType }
>;

@Injectable()
export class FindMovementTypeByIdUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticateId,
    movementTypeId,
  }: FindMovementTypeByIdUseCaseRequest): Promise<FindMovementTypeByIdUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const movementType =
      await this._movementTypesRepository.findById(movementTypeId);
    if (
      !movementType ||
      movementType.companyId.toString() !== user.companyId.toString()
    )
      return left(new MovementTypeNotFoundError());

    return right({ movementType });
  }
}
