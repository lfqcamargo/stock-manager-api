import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { MaterialDetails } from '../../../enterprise/entities/value-objects/material-details';
import { MaterialsRepository } from '../../repositories/materials-repository';
import { MaterialNotFoundError } from './errors/material-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchMaterialsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  groupId?: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
  orderBy?: {
    field: 'name' | 'code' | 'unit' | 'active' | 'groupId';
    direction: 'asc' | 'desc';
  };
}

type FetchMaterialsUseCaseResponse = Either<
  UserNotFoundError | MaterialNotFoundError,
  {
    materials: MaterialDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveMaterials: number;
    };
  }
>;

@Injectable()
export class FetchMaterialsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _materialsRepository: MaterialsRepository,
  ) {}

  async execute({
    authenticatedId,
    groupId,
    code,
    name,
    description,
    active,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchMaterialsUseCaseRequest): Promise<FetchMaterialsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._materialsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        groupId,
        code,
        name,
        description,
        active,
        orderBy,
      },
      { page, itemsPerPage },
    );

    return right({ materials: result.data, meta: result.meta });
  }
}
