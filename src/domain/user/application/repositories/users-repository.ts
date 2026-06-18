import { PaginationParams } from '@/core/repositories/pagination-params';

import { User, UserRole } from '../../enterprise/entities/user';

export interface FetchUsersFilterParams {
  companyId: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
  createdAtStart?: Date;
  createdAtEnd?: Date;
  lastLogin?: Date;
}

export abstract class UsersRepository {
  abstract create(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract fetchAll(
    {
      companyId,
      email,
      name,
      role,
      active,
      createdAtStart,
      createdAtEnd,
      lastLogin,
    }: FetchUsersFilterParams,
    { page, itemsPerPage }: PaginationParams,
  ): Promise<{
    data: User[];
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
  }>;
  abstract update(user: User): Promise<void>;
  abstract delete(user: User): Promise<void>;
}
