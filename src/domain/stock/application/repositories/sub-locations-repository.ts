import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { SubLocationDetails } from '@/domain/stock/enterprise/entities/value-objects/sub-location-details';

export interface FetchSubLocationsFilterParams extends FetchAllFilterParams {
  companyId: string;
  locationId?: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

export abstract class SubLocationsRepository extends Repository<SubLocation> {
  abstract create(
    sublocation: SubLocation,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<SubLocation | null>;
  abstract findByCode(
    companyId: string,
    code: string,
  ): Promise<SubLocation | null>;
  abstract findByName(
    companyId: string,
    locationId: string,
    name: string,
  ): Promise<SubLocation | null>;
  abstract fetchAll(
    filter: FetchSubLocationsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: SubLocationDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(
    sublocation: SubLocation,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchSubLocationsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
