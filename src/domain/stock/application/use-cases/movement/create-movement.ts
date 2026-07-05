import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UnitOfWork } from '@/core/repositories/unit-of-work';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Movement } from '../../../enterprise/entities/movement';
import { MovementDirection } from '../../../enterprise/entities/movement-type';
import { AddressingsRepository } from '../../repositories/addressings-repository';
import { MovementTypesRepository } from '../../repositories/movement-types-repository';
import { MovementsRepository } from '../../repositories/movements-repository';
import { AddressingNotFoundError } from '../addressing/errors/addressing-not-found-error';
import { MovementTypeNotFoundError } from '../movement-type/errors/movement-type-not-found-error';
import { InsufficientBalanceError } from './errors/insufficient-balance-error';

interface CreateMovementUseCaseRequest {
  authenticateId: string;
  addressingId: string;
  movementTypeId: string;
  quantity: number;
  date?: Date;
  observation?: string;
}

type CreateMovementUseCaseResponse = Either<
  | UserNotFoundError
  | AddressingNotFoundError
  | MovementTypeNotFoundError
  | InsufficientBalanceError,
  { movement: Movement }
>;

@Injectable()
export class CreateMovementUseCase {
  constructor(
    private readonly _unitOfWork: UnitOfWork,
    private readonly _usersRepository: UsersRepository,
    private readonly _movementsRepository: MovementsRepository,
    private readonly _addressingsRepository: AddressingsRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticateId,
    addressingId,
    movementTypeId,
    quantity,
    date,
    observation,
  }: CreateMovementUseCaseRequest): Promise<CreateMovementUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticateId);
    if (!user) return left(new UserNotFoundError());

    const addressingDetails =
      await this._addressingsRepository.findByIdWithDetails(addressingId);
    if (
      !addressingDetails ||
      addressingDetails.companyId.toString() !== user.companyId.toString()
    )
      return left(new AddressingNotFoundError());

    if (!addressingDetails.active) return left(new AddressingNotFoundError());

    if (!addressingDetails.material) return left(new AddressingNotFoundError());

    const movementType =
      await this._movementTypesRepository.findById(movementTypeId);
    if (
      !movementType ||
      movementType.companyId.toString() !== user.companyId.toString()
    )
      return left(new MovementTypeNotFoundError());

    if (
      movementType.direction === MovementDirection.OUT &&
      addressingDetails.amount < quantity
    )
      return left(new InsufficientBalanceError());

    const movement = Movement.create({
      companyId: user.companyId,
      addressingId: new UniqueEntityID(addressingId),
      movementTypeId: new UniqueEntityID(movementTypeId),
      userId: user.id,
      quantity,
      date: date ?? new Date(),
      observation,

      movementTypeName: movementType.name,
      movementTypeDirection:
        movementType.direction === MovementDirection.IN ? 'IN' : 'OUT',

      userName: user.name,

      locationId: addressingDetails.location.id.toString(),
      locationCode: addressingDetails.location.code,
      locationName: addressingDetails.location.name,

      subLocationId: addressingDetails.subLocation.id.toString(),
      subLocationCode: addressingDetails.subLocation.code,
      subLocationName: addressingDetails.subLocation.name,

      rowId: addressingDetails.row.id.toString(),
      rowCode: addressingDetails.row.code,
      rowName: addressingDetails.row.name,

      shelfId: addressingDetails.shelf.id.toString(),
      shelfCode: addressingDetails.shelf.code,
      shelfName: addressingDetails.shelf.name,

      positionId: addressingDetails.position.id.toString(),
      positionCode: addressingDetails.position.code,
      positionName: addressingDetails.position.name,

      materialId: addressingDetails.material.id.toString(),
      materialCode: addressingDetails.material.code,
      materialName: addressingDetails.material.name,
      materialDescription: addressingDetails.material.description ?? '',
      materialUnit: String(addressingDetails.material.unit),
      materialPhotoUrl: addressingDetails.material.photoUrl ?? null,
      materialGroupId: addressingDetails.material.groupId.toString(),
      materialGroupName: addressingDetails.material.groupName ?? '',
    });

    const addressing = await this._addressingsRepository.findById(addressingId);
    if (!addressing) return left(new AddressingNotFoundError());

    if (movementType.direction === MovementDirection.IN) {
      addressing.amount = addressing.amount + quantity;
    } else {
      addressing.amount = addressing.amount - quantity;
    }

    await this._unitOfWork.execute(async (ctx) => {
      await this._movementsRepository.create(movement, {
        transactionContext: ctx,
      });
      await this._addressingsRepository.update(addressing, {
        transactionContext: ctx,
      });
    });

    return right({ movement });
  }
}
