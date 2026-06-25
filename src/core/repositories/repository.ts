import { Entity } from '../entities/entity';
import { PaginationParams } from './pagination-params';
import { TransactionContextParams } from './transaction-context';

export interface FetchAllFilterParams extends Record<string, any> {
  [key: string]: any;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export abstract class Repository<E extends Entity<any>> {
  abstract create(entity: E, options?: TransactionContextParams): Promise<void>;
  abstract findById(id: string): Promise<E | null>;
  abstract fetchAll(
    filter: FetchAllFilterParams,
    pagination: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{ data: unknown[]; meta: Record<string, any> }>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchAllFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
