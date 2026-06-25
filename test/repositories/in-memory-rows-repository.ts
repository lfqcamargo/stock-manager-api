import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchRowsFilterParams,
  RowsRepository,
} from '@/domain/stock/application/repositories/rows-repository';
import { Row } from '@/domain/stock/enterprise/entities/row';

export class InMemoryRowsRepository implements RowsRepository {
  public items: Row[] = [];

  async create(row: Row, _options?: TransactionContextParams): Promise<void> {
    this.items.push(row);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Row | null> {
    const row = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(row ?? null);
  }

  async findByCode(companyId: string, code: string): Promise<Row | null> {
    const row = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.code.toUpperCase() === code.toUpperCase(),
    );
    return Promise.resolve(row ?? null);
  }

  async findByName(companyId: string, name: string): Promise<Row | null> {
    const row = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(row ?? null);
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchRowsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: Row[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let rows = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (code)
      rows = rows.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      rows = rows.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      rows = rows.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (orderBy) {
      rows = rows.sort((a, b) => {
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
    const totalItems = rows.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedRows = rows.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedRows.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };
    return Promise.resolve({ data: paginatedRows, meta });
  }

  async update(row: Row, _options?: TransactionContextParams): Promise<void> {
    const index = this.items.findIndex((item) => item.id === row.id);
    if (index >= 0) {
      this.items[index] = row;
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
    { companyId, code, name, description }: FetchRowsFilterParams,
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
