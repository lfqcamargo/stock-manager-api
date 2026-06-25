import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Row } from '@/domain/stock/enterprise/entities/row';

export interface FetchRowsFilterParams extends FetchAllFilterParams {
  companyId: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

export abstract class RowsRepository extends Repository<Row> {
  abstract create(row: Row, options?: TransactionContextParams): Promise<void>;
  abstract findById(id: string): Promise<Row | null>;
  abstract findByCode(companyId: string, code: string): Promise<Row | null>;
  abstract findByName(companyId: string, name: string): Promise<Row | null>;
  abstract fetchAll(
    filter: FetchRowsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: Row[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(row: Row, options?: TransactionContextParams): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
}
