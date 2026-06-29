import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';

import { User, UserRole } from '../../enterprise/entities/user';

export interface FetchUsersFilterParams extends FetchAllFilterParams {
  companyId: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
  createdAtStart?: Date;
  createdAtEnd?: Date;
  orderBy?: {
    field: 'name' | 'email' | 'role' | 'active' | 'createdAt';
    direction: 'asc' | 'desc';
  };
}

export abstract class UsersRepository extends Repository<User> {
  abstract create(
    user: User,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract fetchAll(
    filter: FetchUsersFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
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
  abstract update(
    user: User,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchUsersFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
