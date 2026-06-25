import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Position } from '@/domain/stock/enterprise/entities/position';

export interface FetchPositionsFilterParams extends FetchAllFilterParams {
  companyId: string;
  code?: string;
  name?: string;
  description?: string;
  orderBy?: {
    field: 'name' | 'description' | 'code';
    direction: 'asc' | 'desc';
  };
}

export abstract class PositionsRepository extends Repository<Position> {
  abstract create(
    position: Position,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Position | null>;
  abstract findByCode(
    companyId: string,
    code: string,
  ): Promise<Position | null>;
  abstract findByName(
    companyId: string,
    name: string,
  ): Promise<Position | null>;
  abstract fetchAll(
    filter: FetchPositionsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: Position[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(
    position: Position,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
}
