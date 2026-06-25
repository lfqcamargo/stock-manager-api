import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Position } from '../../../enterprise/entities/position';
import { PositionsRepository } from '../../repositories/positions-repository';
import { PositionNotFoundError } from './errors/position-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchPositionsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

type FetchPositionsUseCaseResponse = Either<
  UserNotFoundError | PositionNotFoundError,
  {
    positions: Position[];
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
export class FetchPositionsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _positionsRepository: PositionsRepository,
  ) {}

  async execute({
    authenticatedId,
    code,
    name,
    description,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchPositionsUseCaseRequest): Promise<FetchPositionsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._positionsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        code,
        name,
        description,
        orderBy,
      },
      { page, itemsPerPage },
    );

    if (!result?.data || result.data.length === 0) {
      return left(new PositionNotFoundError());
    }

    return right({ positions: result.data, meta: result.meta });
  }
}
