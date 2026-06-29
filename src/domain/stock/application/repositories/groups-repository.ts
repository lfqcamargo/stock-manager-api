import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Group } from '@/domain/stock/enterprise/entities/group';

export interface FetchGroupsFilterParams extends FetchAllFilterParams {
  companyId: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
  orderBy?: {
    field: 'name' | 'description' | 'code' | 'active';
    direction: 'asc' | 'desc';
  };
}

export abstract class GroupsRepository extends Repository<Group> {
  abstract create(
    group: Group,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Group | null>;
  abstract findByCode(companyId: string, code: string): Promise<Group | null>;
  abstract findByName(companyId: string, name: string): Promise<Group | null>;
  abstract fetchAll(
    filter: FetchGroupsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: Group[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveGroups: number;
      totalEmptyGroups: number;
    };
  }>;
  abstract update(
    group: Group,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchGroupsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
