import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';

export interface FetchShelfsFilterParams extends FetchAllFilterParams {
  companyId: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

export abstract class ShelfsRepository extends Repository<Shelf> {
  abstract create(
    shelf: Shelf,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Shelf | null>;
  abstract findByCode(companyId: string, code: string): Promise<Shelf | null>;
  abstract findByName(companyId: string, name: string): Promise<Shelf | null>;
  abstract fetchAll(
    filter: FetchShelfsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: Shelf[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(
    shelf: Shelf,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
}
