import { PaginationParams } from '@/core/repositories/pagination-params';
import { Group } from '@/domain/stock/enterprise/entities/group';

export interface FetchGroupsFilterParams {
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

export abstract class GroupsRepository {
  abstract create(group: Group): Promise<void>;
  abstract findById(companyId: string, id: string): Promise<Group | null>;
  abstract findByCode(companyId: string, code: string): Promise<Group | null>;
  abstract findByName(companyId: string, name: string): Promise<Group | null>;
  abstract fetchAll(
    {
      companyId,
      code,
      name,
      description,
      active,
      orderBy,
    }: FetchGroupsFilterParams,
    { page, itemsPerPage }: PaginationParams,
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
  abstract update(group: Group): Promise<void>;
  abstract delete(group: Group): Promise<void>;
}
