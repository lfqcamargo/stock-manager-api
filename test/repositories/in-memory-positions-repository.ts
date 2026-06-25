import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchPositionsFilterParams,
  PositionsRepository,
} from '@/domain/stock/application/repositories/positions-repository';
import { Position } from '@/domain/stock/enterprise/entities/position';

export class InMemoryPositionsRepository implements PositionsRepository {
  public items: Position[] = [];

  async create(
    position: Position,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(position);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Position | null> {
    const position = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(position ?? null);
  }

  async findByCode(companyId: string, code: string): Promise<Position | null> {
    const position = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.code.toUpperCase() === code.toUpperCase(),
    );
    return Promise.resolve(position ?? null);
  }

  async findByName(companyId: string, name: string): Promise<Position | null> {
    const position = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(position ?? null);
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchPositionsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: Position[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let positions = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (code)
      positions = positions.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      positions = positions.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      positions = positions.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (orderBy) {
      positions = positions.sort((a, b) => {
        if (orderBy.field === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (orderBy.field === 'description') {
          return (a.description || '').localeCompare(b.description || '');
        }
        if (orderBy.field === 'code') {
          return a.code.localeCompare(b.code);
        }
        return 0;
      });
    }
    const totalItems = positions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedPositions = positions.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedPositions.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };
    return Promise.resolve({ data: paginatedPositions, meta });
  }

  async update(
    position: Position,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const index = this.items.findIndex((item) => item.id === position.id);
    if (index >= 0) {
      this.items[index] = position;
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
    { companyId, code, name, description }: FetchPositionsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (companyId && item.companyId.toString() !== companyId) return true;
      if (code && !item.code.toLowerCase().includes(code.toLowerCase()))
        return true;
      if (name && !item.name.toLowerCase().includes(name.toLowerCase()))
        return true;
      if (
        description &&
        !(item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase())
      )
        return true;

      return false;
    });

    return Promise.resolve();
  }
}
