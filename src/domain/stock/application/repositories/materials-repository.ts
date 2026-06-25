import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Material } from '@/domain/stock/enterprise/entities/material';

import { MaterialDetails } from '../../enterprise/entities/value-objects/material-details';

export interface FetchMaterialsFilterParams extends FetchAllFilterParams {
  companyId: string;
  groupId?: string;
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
  orderBy?: {
    field: 'name' | 'code' | 'unit' | 'createdAt' | 'active' | 'groupId';
    direction: 'asc' | 'desc';
  };
}

export abstract class MaterialsRepository extends Repository<Material> {
  abstract create(
    material: Material,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Material | null>;
  abstract findByCode(
    companyId: string,
    code: string,
  ): Promise<Material | null>;
  abstract findByName(
    companyId: string,
    name: string,
  ): Promise<Material | null>;
  abstract fetchAll(
    filter: FetchMaterialsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: MaterialDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveMaterials: number;
    };
  }>;
  abstract fetchByGroupId(
    companyId: string,
    groupId: string,
  ): Promise<Material[] | null>;
  abstract update(
    material: Material,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
}
