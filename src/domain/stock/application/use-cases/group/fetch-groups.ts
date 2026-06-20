import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { Group } from '../../../enterprise/entities/group';
import { GroupsRepository } from '../../repositories/groups-repository';
import { GroupNotFoundError } from './errors/group-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchGroupsUseCaseRequest extends PaginationParams {
  authenticatedId: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
  orderBy?: {
    field: 'name' | 'description' | 'code' | 'active';
    direction: 'asc' | 'desc';
  };
}

type FetchGroupsUseCaseResponse = Either<
  UserNotFoundError | GroupNotFoundError,
  {
    groups: Group[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveGroups: number;
      totalEmptyGroups: number;
    };
  }
>;

@Injectable()
export class FetchGroupsUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _groupsRepository: GroupsRepository,
  ) {}

  async execute({
    authenticatedId,
    code,
    name,
    description,
    active,
    orderBy,
    page = 1,
    itemsPerPage = 20,
  }: FetchGroupsUseCaseRequest): Promise<FetchGroupsUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const result = await this._groupsRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        code,
        name,
        description,
        active,
        orderBy,
      },
      { page, itemsPerPage },
    );

    if (!result?.data || result.data.length === 0) {
      return left(new GroupNotFoundError());
    }

    return right({ groups: result.data, meta: result.meta });
  }
}
