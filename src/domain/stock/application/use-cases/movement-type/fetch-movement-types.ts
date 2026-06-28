import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import {
  MovementDirection,
  MovementType,
} from '../../../enterprise/entities/movement-type';
import { MovementTypesRepository } from '../../repositories/movement-types-repository';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchMovementTypesUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  name?: string;
  direction?: MovementDirection;
  orderBy?: {
    field: 'name' | 'direction';
    direction: 'asc' | 'desc';
  };
}

type FetchMovementTypesUseCaseResponse = Either<
  UserNotFoundError,
  {
    movementTypes: MovementType[];
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
export class FetchMovementTypesUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _movementTypesRepository: MovementTypesRepository,
  ) {}

  async execute({
    authenticatedId,
    name,
    direction,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchMovementTypesUseCaseRequest): Promise<FetchMovementTypesUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._movementTypesRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        name,
        direction,
        orderBy,
      },
      { page, itemsPerPage },
    );

    return right({ movementTypes: result.data, meta: result.meta });
  }
}
