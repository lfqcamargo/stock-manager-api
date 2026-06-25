import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { LocationsRepository } from '@/domain/stock/application/repositories/locations-repository';
import {
  FetchSubLocationsFilterParams,
  SubLocationsRepository,
} from '@/domain/stock/application/repositories/sub-locations-repository';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { SubLocationDetails } from '@/domain/stock/enterprise/entities/value-objects/sub-location-details';

export class InMemorySubLocationsRepository implements SubLocationsRepository {
  constructor(private locationRepository: LocationsRepository) {}

  public items: SubLocation[] = [];

  async create(
    sublocation: SubLocation,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(sublocation);
    return Promise.resolve();
  }

  async findById(id: string): Promise<SubLocation | null> {
    const sublocation = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(sublocation ?? null);
  }

  async findByCode(
    companyId: string,
    code: string,
  ): Promise<SubLocation | null> {
    const sublocation = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.code.toUpperCase() === code.toUpperCase(),
    );
    return Promise.resolve(sublocation ?? null);
  }

  async findByName(
    companyId: string,
    locationId: string,
    name: string,
  ): Promise<SubLocation | null> {
    const sublocation = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.locationId.toString() === locationId &&
        item.name.toLowerCase() === name.toLowerCase(),
    );
    return Promise.resolve(sublocation ?? null);
  }

  async fetchAll(
    {
      companyId,
      locationId,
      code,
      name,
      description,
      orderBy,
    }: FetchSubLocationsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: SubLocationDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let sublocations = this.items.filter(
      (item) => item.companyId.toString() === companyId,
    );
    if (locationId) {
      sublocations = sublocations.filter(
        (item) => item.locationId.toString() === locationId,
      );
    }
    if (code)
      sublocations = sublocations.filter((item) =>
        item.code.toLowerCase().includes(code.toLowerCase()),
      );
    if (name)
      sublocations = sublocations.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    if (description)
      sublocations = sublocations.filter((item) =>
        (item.description || '')
          .toLowerCase()
          .includes(description.toLowerCase()),
      );
    if (orderBy) {
      sublocations = sublocations.sort((a, b) => {
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

    const totalItems = sublocations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedSubLocations = sublocations.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );

    const locationIds = new Set(
      paginatedSubLocations.map((s) => s.locationId.toString()),
    );
    const locationMap = new Map();
    for (const locId of locationIds) {
      const loc = await this.locationRepository.findById(locId);
      if (loc) locationMap.set(locId, loc);
    }

    const subLocationDetails = paginatedSubLocations.map((sublocation) => {
      const location = locationMap.get(sublocation.locationId.toString());
      return SubLocationDetails.create({
        id: sublocation.id,
        companyId: sublocation.companyId,
        location: location,
        code: sublocation.code,
        name: sublocation.name,
        description: sublocation.description,
      });
    });

    const meta = {
      totalItems,
      itemCount: paginatedSubLocations.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };

    return Promise.resolve({
      data: subLocationDetails,
      meta,
    });
  }

  async update(
    sublocation: SubLocation,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const index = this.items.findIndex((item) => item.id === sublocation.id);
    if (index >= 0) {
      this.items[index] = sublocation;
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
    {
      companyId,
      locationId,
      code,
      name,
      description,
    }: FetchSubLocationsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (companyId && item.companyId.toString() !== companyId) return true;
      if (locationId && item.locationId.toString() !== locationId) return true;
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
