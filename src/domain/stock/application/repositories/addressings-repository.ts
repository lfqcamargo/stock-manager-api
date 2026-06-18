import { PaginationParams } from '@/core/repositories/pagination-params';
import { Addressing } from '@/domain/stock/enterprise/entities/addressing';

import { AddressingDetails } from '../../enterprise/entities/value-objects/addressing-details';

export interface AddressingParams {
  materialId?: string;
  locationId?: string;
  subLocationId?: string;
  rowId?: string;
  shelfId?: string;
  positionId?: string;
  active?: boolean;
  orderBy?: {
    field: 'createdAt' | 'amount' | 'active';
    direction: 'asc' | 'desc';
  };
}

export abstract class AddressingsRepository {
  abstract create(addressing: Addressing): Promise<void>;
  abstract findById(companyId: string, id: string): Promise<Addressing | null>;
  abstract findByIdDetails(
    companyId: string,
    id: string,
  ): Promise<AddressingDetails | null>;
  abstract fetchAll(
    companyId: string,
    { page, itemsPerPage }: PaginationParams,
    params: AddressingParams,
  ): Promise<{
    data: AddressingDetails[] | null;
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  } | null>;
  abstract update(addressing: Addressing): Promise<void>;
  abstract delete(addressing: Addressing): Promise<void>;
}
