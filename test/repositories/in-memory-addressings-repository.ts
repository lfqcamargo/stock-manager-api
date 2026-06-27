import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  AddressingsRepository,
  FetchAddressingsFilterParams,
} from '@/domain/stock/application/repositories/addressings-repository';
import { Addressing } from '@/domain/stock/enterprise/entities/addressing';
import { Location } from '@/domain/stock/enterprise/entities/location';
import { Position } from '@/domain/stock/enterprise/entities/position';
import { Row } from '@/domain/stock/enterprise/entities/row';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { AddressingDetails } from '@/domain/stock/enterprise/entities/value-objects/addressing-details';

export class InMemoryAddressingsRepository implements AddressingsRepository {
  public items: Addressing[] = [];

  async create(
    addressing: Addressing,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items.push(addressing);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Addressing | null> {
    const addressing = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(addressing ?? null);
  }

  async findByAddress({
    companyId,
    locationId,
    subLocationId,
    rowId,
    shelfId,
    positionId,
  }: {
    companyId: string;
    locationId: string;
    subLocationId: string;
    rowId: string;
    shelfId: string;
    positionId: string;
  }): Promise<Addressing | null> {
    const found = this.items.find(
      (item) =>
        item.companyId.toString() === companyId &&
        item.locationId.toString() === locationId &&
        item.subLocationId.toString() === subLocationId &&
        item.rowId.toString() === rowId &&
        item.shelfId.toString() === shelfId &&
        item.positionId.toString() === positionId,
    );
    return Promise.resolve(found ?? null);
  }

  async fetchAll(
    filter: FetchAddressingsFilterParams,
    paginationParams: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: AddressingDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    let addressings = this.items.filter(
      (item) => item.companyId.toString() === filter.companyId,
    );
    if (filter.locationId)
      addressings = addressings.filter(
        (item) => item.locationId.toString() === filter.locationId,
      );
    if (filter.subLocationId)
      addressings = addressings.filter(
        (item) => item.subLocationId.toString() === filter.subLocationId,
      );
    if (filter.rowId)
      addressings = addressings.filter(
        (item) => item.rowId.toString() === filter.rowId,
      );
    if (filter.shelfId)
      addressings = addressings.filter(
        (item) => item.shelfId.toString() === filter.shelfId,
      );
    if (filter.positionId)
      addressings = addressings.filter(
        (item) => item.positionId.toString() === filter.positionId,
      );
    if (filter.materialId)
      addressings = addressings.filter(
        (item) => item.materialId?.toString() === filter.materialId,
      );
    if (filter.active !== undefined)
      addressings = addressings.filter((item) => item.active === filter.active);
    if (filter.minAmount !== undefined) {
      const minAmount = filter.minAmount;
      addressings = addressings.filter((item) => item.amount >= minAmount);
    }
    if (filter.maxAmount !== undefined) {
      const maxAmount = filter.maxAmount;
      addressings = addressings.filter((item) => item.amount <= maxAmount);
    }

    if (filter.orderBy) {
      const orderBy = filter.orderBy;
      addressings = addressings.sort((a, b) => {
        if (orderBy.field === 'amount') {
          return orderBy.direction === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        if (orderBy.field === 'active') {
          return orderBy.direction === 'asc'
            ? Number(a.active) - Number(b.active)
            : Number(b.active) - Number(a.active);
        }
        return 0;
      });
    }

    const totalItems = addressings.length;
    const { page, itemsPerPage } = paginationParams;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedAddressings = addressings.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage,
    );
    const meta = {
      totalItems,
      itemCount: paginatedAddressings.length,
      itemsPerPage,
      totalPages,
      currentPage: page,
    };
    return Promise.resolve({
      data: paginatedAddressings.map((a) => this.toDetails(a)),
      meta,
    });
  }

  async update(addressing: Addressing, _options?: TransactionContextParams) {
    const index = this.items.findIndex((item) => item.id === addressing.id);
    if (index >= 0) {
      this.items[index] = addressing;
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
    filters: FetchAddressingsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    this.items = this.items.filter((item) => {
      if (filters.companyId && filters.companyId === item.companyId.toString())
        return false;
      if (
        filters.locationId &&
        filters.locationId === item.locationId.toString()
      )
        return false;
      if (
        filters.subLocationId &&
        filters.subLocationId === item.subLocationId.toString()
      )
        return false;
      if (filters.rowId && filters.rowId === item.rowId.toString())
        return false;
      if (filters.shelfId && filters.shelfId === item.shelfId.toString())
        return false;
      if (
        filters.positionId &&
        filters.positionId === item.positionId.toString()
      )
        return false;
      if (
        filters.materialId &&
        filters.materialId === item.materialId?.toString()
      )
        return false;
      return true;
    });

    return Promise.resolve();
  }

  toDetails(addressing: any): AddressingDetails {
    if (addressing instanceof AddressingDetails) return addressing;
    return AddressingDetails.create({
      companyId: addressing.companyId,
      id: addressing.id,
      location: Location.create({
        companyId: addressing.companyId,
        name: 'Mock Location',
        code: 'MOCK',
      }),
      subLocation: SubLocation.create({
        companyId: addressing.companyId,
        locationId: addressing.locationId,
        name: 'Mock SubLocation',
        code: 'MOCK',
      }),
      row: Row.create({
        companyId: addressing.companyId,
        name: 'Mock Row',
        code: 'MOCK',
      }),
      shelf: Shelf.create({
        companyId: addressing.companyId,
        name: 'Mock Shelf',
        code: 'MOCK',
      }),
      position: Position.create({
        companyId: addressing.companyId,
        name: 'Mock Position',
        code: 'MOCK',
      }),
      material: null,
      amount: addressing.amount,
      active: addressing.active,
    });
  }
}
