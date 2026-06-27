import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  AddressingsRepository,
  FetchAddressingsFilterParams,
} from '@/domain/stock/application/repositories/addressings-repository';
import { Addressing } from '@/domain/stock/enterprise/entities/addressing';
import { AddressingDetails } from '@/domain/stock/enterprise/entities/value-objects/addressing-details';

import { PrismaAddressingDetailsMapper } from '../mappers/prisma-addressing-details-mapper';
import { PrismaAddressingMapper } from '../mappers/prisma-addressing-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAddressingsRepository implements AddressingsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    addressing: Addressing,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.addressing.create({
      data: PrismaAddressingMapper.toPrisma(addressing),
    });
  }

  async findById(id: string): Promise<Addressing | null> {
    const addressing = await this.prisma.addressing.findUnique({
      where: { id },
    });
    return addressing ? PrismaAddressingMapper.toDomain(addressing) : null;
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
    const addressing = await this.prisma.addressing.findFirst({
      where: {
        companyId,
        locationId,
        subLocationId,
        rowId,
        shelfId,
        positionId,
      },
    });
    return addressing ? PrismaAddressingMapper.toDomain(addressing) : null;
  }

  async fetchAll(
    filter: FetchAddressingsFilterParams,
    { page, itemsPerPage }: PaginationParams,
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
    const where = this.buildWhere(filter);

    const [totalItems, addressings] = await Promise.all([
      this.prisma.addressing.count({ where }),
      this.prisma.addressing.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: filter.orderBy
          ? { [filter.orderBy.field]: filter.orderBy.direction }
          : { createdAt: 'desc' },
        include: {
          location: true,
          subLocation: true,
          row: true,
          shelf: true,
          position: true,
          material: true,
        },
      }),
    ]);

    return {
      data: addressings.map((addressing) =>
        PrismaAddressingDetailsMapper.toDomain(addressing),
      ),
      meta: {
        totalItems,
        itemCount: addressings.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    addressing: Addressing,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.addressing.update({
      where: { id: addressing.id.toString() },
      data: PrismaAddressingMapper.toPrisma(addressing),
    });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.addressing.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchAddressingsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.addressing.deleteMany({
      where: this.buildWhere(filters),
    });
  }

  private buildWhere({
    companyId,
    materialId,
    locationId,
    subLocationId,
    rowId,
    shelfId,
    positionId,
    active,
    minAmount,
    maxAmount,
  }: FetchAddressingsFilterParams): Prisma.AddressingWhereInput {
    const where: Prisma.AddressingWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (materialId) where.materialId = materialId;
    if (locationId) where.locationId = locationId;
    if (subLocationId) where.subLocationId = subLocationId;
    if (rowId) where.rowId = rowId;
    if (shelfId) where.shelfId = shelfId;
    if (positionId) where.positionId = positionId;
    if (active !== undefined) where.active = active;
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    return where;
  }
}
