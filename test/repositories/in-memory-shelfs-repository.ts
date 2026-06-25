import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchShelfsFilterParams,
  ShelfsRepository,
} from '@/domain/stock/application/repositories/shelfs-repository';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';

export class InMemoryShelfsRepository implements ShelfsRepository {
  public items: Shelf[] = [];

  async create(
    shelf: Shelf,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(shelf);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Shelf | null> {
    const shelf = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(shelf ?? null);
  }

  async findByCode(companyId: string, code: string): Promise<Shelf | null> {
    const shelf = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.code.toUpperCase() === code.toUpperCase(),
    );
    return Promise.resolve(shelf ?? null);
  }

  async findByName(companyId: string, name: string): Promise<Shelf | null> {
    const shelf = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(shelf ?? null);
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchShelfsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: Shelf[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let shelfs = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (code)
      shelfs = shelfs.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      shelfs = shelfs.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      shelfs = shelfs.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (orderBy) {
      shelfs = shelfs.sort((a, b) => {
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
    const totalItems = shelfs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedShelfs = shelfs.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedShelfs.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };
    return Promise.resolve({ data: paginatedShelfs, meta });
  }

  async update(
    shelf: Shelf,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const index = this.items.findIndex((item) => item.id === shelf.id);
    if (index >= 0) {
      this.items[index] = shelf;
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
    { companyId, code, name, description }: FetchShelfsFilterParams,
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
