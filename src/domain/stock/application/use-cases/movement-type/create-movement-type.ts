import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import {
  MovementDirection,
  MovementType,
} from '../../../enterprise/entities/movement-type';
import { MovementTypesRepository } from '../../repositories/movement-types-repository';
import { AlreadyExistsMovementTypeError } from './errors/already-exists-movement-type-error';

interface CreateMovementTypeUseCaseRequest {
  authenticateId: string;
  name: string;
  direction: MovementDirection;
}

type CreateMovementTypeUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | AlreadyExistsMovementTypeError,
  { movementType: MovementType }
>;

@Injectable()
export class CreateMovementTypeUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticateId,
    name,
    direction,
  }: CreateMovementTypeUseCaseRequest): Promise<CreateMovementTypeUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const existing = await this._movementTypesRepository.findByName(
      user.companyId.toString(),
      name,
    );
    if (existing) return left(new AlreadyExistsMovementTypeError());

    const movementType = MovementType.create({
      companyId: user.companyId,
      name,
      direction,
    });

    await this._movementTypesRepository.create(movementType);

    return right({ movementType });
  }
}
