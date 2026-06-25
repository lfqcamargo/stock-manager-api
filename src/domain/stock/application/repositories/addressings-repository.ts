import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Addressing } from '@/domain/stock/enterprise/entities/addressing';

import { AddressingDetails } from '../../enterprise/entities/value-objects/addressing-details';

export interface FetchAddressingsFilterParams extends FetchAllFilterParams {
  companyId: string;
  materialId?: string;
  locationId?: string;
  subLocationId?: string;
  rowId?: string;
  shelfId?: string;
  positionId?: string;
  active?: boolean;
  minAmount?: number;
  maxAmount?: number;
  orderBy?: {
    field: 'createdAt' | 'amount' | 'active';
    direction: 'asc' | 'desc';
  };
}

export abstract class AddressingsRepository extends Repository<Addressing> {
  abstract create(
    addressing: Addressing,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Addressing | null>;
  abstract fetchAll(
    filter: FetchAddressingsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: AddressingDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(
    addressing: Addressing,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchAddressingsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
