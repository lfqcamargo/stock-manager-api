import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { MovementTypesRepository } from '../../repositories/movement-types-repository';
import { MovementTypeNotFoundError } from './errors/movement-type-not-found-error';

interface DeleteMovementTypeUseCaseRequest {
  authenticateId: string;
  movementTypeId: string;
}

type DeleteMovementTypeUseCaseResponse = Either<
  UserNotFoundError | UserNotAllowedError | MovementTypeNotFoundError,
  void
>;

@Injectable()
export class DeleteMovementTypeUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticateId,
    movementTypeId,
  }: DeleteMovementTypeUseCaseRequest): Promise<DeleteMovementTypeUseCaseResponse> {
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

    await this._movementTypesRepository.delete(movementTypeId);

    return right(void 0);
  }
}
