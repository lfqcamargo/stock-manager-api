import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { Movement } from '@/domain/stock/enterprise/entities/movement';

export interface FetchMovementsFilterParams extends FetchAllFilterParams {
  companyId: string;
  addressingId?: string;
  movementTypeId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minQuantity?: number;
  maxQuantity?: number;
  orderBy?: {
    field: 'date' | 'quantity' | 'createdAt';
    direction: 'asc' | 'desc';
  };
}

export abstract class MovementsRepository extends Repository<Movement> {
  abstract create(
    movement: Movement,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Movement | null>;
  abstract fetchAll(
    filter: FetchMovementsFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: Movement[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchMovementsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
