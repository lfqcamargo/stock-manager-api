import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { User, UserRole } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
}

interface FetchUsersUseCaseRequest extends PaginationParams {
  authenticatedUserId: string;
  email?: string;
  name?: string;
  role?: UserRole;
  active?: boolean;
  createdAtStart?: Date;
  createdAtEnd?: Date;
  orderBy?: {
    field: 'name' | 'email' | 'role' | 'active' | 'createdAt';
    direction: 'asc' | 'desc';
  };
}

type FetchUsersUseCaseResult = Either<
  UserNotAdminError | UserNotFoundError,
  {
    users: User[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalAdmin: number;
      totalMaanger: number;
      totalEmployee: number;
      totalActive: number;
      totalInactive: number;
      lastCreated: Date;
    };
  }
>;

@Injectable()
export class FetchUsersCompanyIdUseCase {
  constructor(private readonly _usersRepository: UsersRepository) {}

  async execute({
    authenticatedUserId,
    page = 1,
    itemsPerPage = 20,
    email,
    name,
    role,
    active,
    createdAtStart,
    createdAtEnd,
    orderBy,
  }: FetchUsersUseCaseRequest): Promise<FetchUsersUseCaseResult> {
    const user = await this._usersRepository.findById(authenticatedUserId);
    if (!user) return left(new UserNotFoundError());

    if (!user.isAdmin()) {
      return left(new UserNotAdminError());
    }

    const result = await this._usersRepository.fetchAll(
      {
        companyId: user.companyId.toString(),
        email,
        name,
        role,
        active,
        createdAtStart,
        createdAtEnd,
        orderBy,
      },
      { page, itemsPerPage },
    );

    return right({ users: result?.data, meta: result?.meta });
  }
}
