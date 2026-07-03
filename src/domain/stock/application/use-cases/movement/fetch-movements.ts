import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Movement } from '../../../enterprise/entities/movement';
import { MovementsRepository } from '../../repositories/movements-repository';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchMovementsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  addressingId?: string;
  locationId?: string;
  subLocationId?: string;
  rowId?: string;
  shelfId?: string;
  positionId?: string;
  materialId?: string;
  movementTypeId?: string;
  direction?: 'IN' | 'OUT';
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minQuantity?: number;
  maxQuantity?: number;
  orderBy?: {
    field: 'date' | 'quantity' | 'createdAt';
    direction: 'asc' | 'desc';
  };
}

type FetchMovementsUseCaseResponse = Either<
  UserNotFoundError,
  {
    movements: Movement[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
>;

@Injectable()
export class FetchMovementsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementsRepository: MovementsRepository,
  ) {}

  async execute({
    authenticatedId,
    addressingId,
    locationId,
    subLocationId,
    rowId,
    shelfId,
    positionId,
    materialId,
    movementTypeId,
    direction,
    userId,
    dateFrom,
    dateTo,
    minQuantity,
    maxQuantity,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchMovementsUseCaseRequest): Promise<FetchMovementsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._movementsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        addressingId,
        locationId,
        subLocationId,
        rowId,
        shelfId,
        positionId,
        materialId,
        movementTypeId,
        direction,
        userId,
        dateFrom,
        dateTo,
        minQuantity,
        maxQuantity,
        orderBy,
      },
      { page, itemsPerPage },
    );

    return right({ movements: result.data, meta: result.meta });
  }
}
