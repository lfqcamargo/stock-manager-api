import { PaginationParams } from '@/core/repositories/pagination-params';
import { Material } from '@/domain/stock/enterprise/entities/material';

import { MaterialDetails } from '../../enterprise/entities/value-objects/material-details';

export interface FetchMaterialsFilterParams {
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

export abstract class MaterialsRepository {
  abstract create(material: Material): Promise<void>;
  abstract findById(companyId: string, id: string): Promise<Material | null>;
  abstract findByCode(
    companyId: string,
    code: string,
  ): Promise<Material | null>;
  abstract findByName(
    companyId: string,
    name: string,
  ): Promise<Material | null>;
  abstract fetchAll(
    {
      companyId,
      groupId,
      code,
      name,
      description,
      active,
      orderBy,
    }: FetchMaterialsFilterParams,
    { page, itemsPerPage }: PaginationParams,
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
  abstract update(material: Material): Promise<void>;
  abstract delete(material: Material): Promise<void>;
}
