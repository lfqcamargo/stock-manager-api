import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingDetails } from '../../../enterprise/entities/value-objects/addressing-details';
import { AddressingsRepository } from '../../repositories/addressings-repository';
import { AddressingNotFoundError } from './errors/addressing-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchAddressingsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  locationId?: string;
  subLocationId?: string;
  rowId?: string;
  shelfId?: string;
  positionId?: string;
  materialId?: string;
  active?: boolean;
  minAmount?: number;
  maxAmount?: number;
  orderBy?: {
    field: 'createdAt' | 'amount' | 'active';
    direction: 'asc' | 'desc';
  };
}

type FetchAddressingsUseCaseResponse = Either<
  UserNotFoundError | AddressingNotFoundError,
  {
    addressings: AddressingDetails[];
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
export class FetchAddressingsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _addressingsRepository: AddressingsRepository,
  ) {}

  async execute({
    authenticatedId,
    locationId,
    subLocationId,
    rowId,
    shelfId,
    positionId,
    materialId,
    active,
    minAmount,
    maxAmount,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchAddressingsUseCaseRequest): Promise<FetchAddressingsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._addressingsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        locationId,
        subLocationId,
        rowId,
        shelfId,
        positionId,
        materialId,
        active,
        minAmount,
        maxAmount,
        orderBy,
      },
      { page, itemsPerPage },
    );

    if (!result?.data || result.data.length === 0) {
      return left(new AddressingNotFoundError());
    }

    return right({ addressings: result.data, meta: result.meta });
  }
}
