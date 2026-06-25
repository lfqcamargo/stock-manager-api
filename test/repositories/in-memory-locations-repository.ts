import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchLocationsFilterParams,
  LocationsRepository,
} from '@/domain/stock/application/repositories/locations-repository';
import { Location } from '@/domain/stock/enterprise/entities/location';

export class InMemoryLocationsRepository implements LocationsRepository {
  public items: Location[] = [];

  async create(
    location: Location,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(location);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Location | null> {
    const location = this.items.find((item) => item.id.toString() === id);

    return Promise.resolve(location ?? null);
  }

  async findByCode(companyId: string, code: string): Promise<Location | null> {
    const location = this.items.find(
      (item) => item.companyId.toString() === companyId && item.code === code,
    );
    return Promise.resolve(location ?? null);
  }

  async findByName(companyId: string, name: string): Promise<Location | null> {
    const location = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(location ?? null);
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchLocationsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: Location[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let locations = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (code)
      locations = locations.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      locations = locations.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      locations = locations.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (orderBy) {
      locations = locations.sort((a, b) => {
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

    const totalItems = locations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedLocations = locations.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedLocations.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };
    return Promise.resolve({
      data: paginatedLocations,
      meta,
    });
  }

  async update(location: Location, _options?: TransactionContextParams) {
    const index = this.items.findIndex((item) => item.id === location.id);
    if (index >= 0) {
      this.items[index] = location;
    }
    return Promise.resolve();
  }

  async delete(id: string, _options?: TransactionContextParams) {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }

  async deleteMany(
    { companyId, code, name, description }: FetchLocationsFilterParams,
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
