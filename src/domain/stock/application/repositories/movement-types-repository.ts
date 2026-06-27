import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchAllFilterParams,
  Repository,
} from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { MovementType } from '@/domain/stock/enterprise/entities/movement-type';

export interface FetchMovementTypesFilterParams extends FetchAllFilterParams {
  companyId: string;
  name?: string;
  direction?: MovementDirection;
  orderBy?: {
    field: 'name' | 'direction';
    direction: 'asc' | 'desc';
  };
}

export abstract class MovementTypesRepository extends Repository<MovementType> {
  abstract create(
    movementType: MovementType,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<MovementType | null>;
  abstract findByName(
    companyId: string,
    name: string,
  ): Promise<MovementType | null>;
  abstract fetchAll(
    filter: FetchMovementTypesFilterParams,
    paginationParams: PaginationParams,
    options?: TransactionContextParams,
  ): Promise<{
    data: MovementType[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }>;
  abstract update(
    movementType: MovementType,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: FetchMovementTypesFilterParams,
    options?: TransactionContextParams,
  ): Promise<void>;
}
