import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchMovementTypesFilterParams,
  MovementTypesRepository,
} from '@/domain/stock/application/repositories/movement-types-repository';
import { MovementType } from '@/domain/stock/enterprise/entities/movement-type';

export class InMemoryMovementTypesRepository
  implements MovementTypesRepository
{
  public items: MovementType[] = [];

  async create(
    movementType: MovementType,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(movementType);
    return Promise.resolve();
  }

  async findById(id: string): Promise<MovementType | null> {
    const movementType = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(movementType ?? null);
  }

  async findByName(
    companyId: string,
    name: string,
  ): Promise<MovementType | null> {
    const movementType = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(movementType ?? null);
  }

  async fetchAll(
    { companyId, name, direction, orderBy }: FetchMovementTypesFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: MovementType[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let movementTypes = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );

    if (name)
      movementTypes = movementTypes.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );

    if (direction)
      movementTypes = movementTypes.filter(
        (item) => item.direction === direction,
      );

    if (orderBy) {
      movementTypes = movementTypes.sort((a, b) => {
        if (orderBy.field === 'name') {
          const cmp = a.name.localeCompare(b.name);
          return orderBy.direction === 'asc' ? cmp : -cmp;
        }
        if (orderBy.field === 'direction') {
          const cmp = a.direction.localeCompare(b.direction);
          return orderBy.direction === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    const totalItems = movementTypes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedMovementTypes = movementTypes.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedMovementTypes.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };

    return Promise.resolve({ data: paginatedMovementTypes, meta });
  }

  async update(
    movementType: MovementType,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === movementType.id.toString(),
    );
    if (index >= 0) {
      this.items[index] = movementType;
    }
    return Promise.resolve();
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }

  async deleteMany(
    { companyId, name, direction }: FetchMovementTypesFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (companyId && item.companyId.toString() !== companyId) return true;
      if (name && !item.name.toLowerCase().includes(name.toLowerCase()))
        return true;
      if (direction && item.direction !== direction) return true;
      return false;
    });

    return Promise.resolve();
  }
}
