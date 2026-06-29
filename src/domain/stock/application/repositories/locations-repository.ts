import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Location } from '@/domain/stock/enterprise/entities/location';

export interface FetchLocationsFilterParams extends FetchAllFilterParams {
  companyId: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

export abstract class LocationsRepository extends Repository<Location> {
  abstract create(
    location: Location,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Location | null>;
  abstract findByCode(
    companyId: string,
    code: string,
  ): Promise<Location | null>;
  abstract findByName(
    companyId: string,
    name: string,
  ): Promise<Location | null>;
  abstract fetchAll(
    filter: FetchLocationsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: Location[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(
    location: Location,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchLocationsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
