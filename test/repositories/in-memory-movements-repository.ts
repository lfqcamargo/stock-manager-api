import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchMovementsFilterParams,
  MovementsRepository,
} from '@/domain/stock/application/repositories/movements-repository';
import { Movement } from '@/domain/stock/enterprise/entities/movement';

export class InMemoryMovementsRepository implements MovementsRepository {
  public items: Movement[] = [];

  async create(
    movement: Movement,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(movement);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Movement | null> {
    const movement = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(movement ?? null);
  }

  async fetchAll(
    {
      companyId,
      addressingId,
      movementTypeId,
      userId,
      dateFrom,
      dateTo,
      minQuantity,
      maxQuantity,
      orderBy,
    }: FetchMovementsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: Movement[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let movements = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );

    if (addressingId)
      movements = movements.filter(
        (item) => item.addressingId.toString() === addressingId,
      );

    if (movementTypeId)
      movements = movements.filter(
        (item) => item.movementTypeId.toString() === movementTypeId,
      );

    if (userId)
      movements = movements.filter((item) => item.userId.toString() === userId);

    if (dateFrom) movements = movements.filter((item) => item.date >= dateFrom);

    if (dateTo) movements = movements.filter((item) => item.date <= dateTo);

    if (minQuantity !== undefined)
      movements = movements.filter((item) => item.quantity >= minQuantity);

    if (maxQuantity !== undefined)
      movements = movements.filter((item) => item.quantity <= maxQuantity);

    if (orderBy) {
      movements = movements.sort((a, b) => {
        if (orderBy.field === 'date') {
          const cmp = a.date.getTime() - b.date.getTime();
          return orderBy.direction === 'asc' ? cmp : -cmp;
        }
        if (orderBy.field === 'quantity') {
          const cmp = a.quantity - b.quantity;
          return orderBy.direction === 'asc' ? cmp : -cmp;
        }
        if (orderBy.field === 'createdAt') {
          const cmp = a.createdAt.getTime() - b.createdAt.getTime();
          return orderBy.direction === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    const totalItems = movements.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedMovements = movements.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedMovements.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };

    return Promise.resolve({ data: paginatedMovements, meta });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }

  async deleteMany(
    filters: FetchMovementsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (filters.companyId && item.companyId.toString() !== filters.companyId)
        return true;
      if (
        filters.addressingId &&
        item.addressingId.toString() !== filters.addressingId
      )
        return true;
      if (
        filters.movementTypeId &&
        item.movementTypeId.toString() !== filters.movementTypeId
      )
        return true;
      if (filters.userId && item.userId.toString() !== filters.userId)
        return true;
      return false;
    });

    return Promise.resolve();
  }
}
