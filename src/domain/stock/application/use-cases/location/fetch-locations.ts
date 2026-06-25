import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Location } from '../../../enterprise/entities/location';
import { LocationsRepository } from '../../repositories/locations-repository';
import { LocationNotFoundError } from './errors/location-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchLocationsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

type FetchLocationsUseCaseResponse = Either<
  UserNotFoundError | LocationNotFoundError,
  {
    locations: Location[];
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
export class FetchLocationsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _locationsRepository: LocationsRepository,
  ) {}

  async execute({
    authenticatedId,
    code,
    name,
    description,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchLocationsUseCaseRequest): Promise<FetchLocationsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._locationsRepository.fetchAll(
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
      return left(new LocationNotFoundError());
    }

    return right({ locations: result.data, meta: result.meta });
  }
}
