import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import {
  MovementType,
  MovementDirection,
} from '../../../enterprise/entities/movement-type';
import { MovementTypesRepository } from '../../repositories/movement-types-repository';
import { AlreadyExistsMovementTypeError } from './errors/already-exists-movement-type-error';
import { MovementTypeNotFoundError } from './errors/movement-type-not-found-error';

interface EditMovementTypeUseCaseRequest {
  authenticateId: string;
  movementTypeId: string;
  name: string;
  direction: MovementDirection;
}

type EditMovementTypeUseCaseResponse = Either<
  | UserNotFoundError
  | UserNotAllowedError
  | MovementTypeNotFoundError
  | AlreadyExistsMovementTypeError,
  { movementType: MovementType }
>;

@Injectable()
export class EditMovementTypeUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticateId,
    movementTypeId,
    name,
    direction,
  }: EditMovementTypeUseCaseRequest): Promise<EditMovementTypeUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());
    if (!user.isAdmin() && !user.isManager())
      return left(new UserNotAllowedError());

    const movementType =
      await this._movementTypesRepository.findById(movementTypeId);
    if (
      !movementType ||
      movementType.companyId.toString() !== user.companyId.toString()
    )
      return left(new MovementTypeNotFoundError());

    if (movementType.name !== name) {
      const existing = await this._movementTypesRepository.findByName(
        user.companyId.toString(),
        name,
      );
      if (existing) return left(new AlreadyExistsMovementTypeError());

      movementType.name = name;
    }

    movementType.direction = direction;

    await this._movementTypesRepository.update(movementType);

    return right({ movementType });
  }
}
