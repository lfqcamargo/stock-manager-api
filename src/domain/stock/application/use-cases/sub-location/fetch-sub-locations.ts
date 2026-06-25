import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { SubLocationDetails } from '../../../enterprise/entities/value-objects/sub-location-details';
import { SubLocationsRepository } from '../../repositories/sub-locations-repository';
import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchSubLocationsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  locationId?: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

type FetchSubLocationsUseCaseResponse = Either<
  UserNotFoundError | SubLocationNotFoundError,
  {
    subLocations: SubLocationDetails[];
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
export class FetchSubLocationsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _subLocationsRepository: SubLocationsRepository,
  ) {}

  async execute({
    authenticatedId,
    locationId,
    code,
    name,
    description,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchSubLocationsUseCaseRequest): Promise<FetchSubLocationsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._subLocationsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        locationId,
        code,
        name,
        description,
        orderBy,
      },
      { page, itemsPerPage },
    );

    if (!result?.data || result.data.length === 0) {
      return left(new SubLocationNotFoundError());
    }

    return right({ subLocations: result.data, meta: result.meta });
  }
}
