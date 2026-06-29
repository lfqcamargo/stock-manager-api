import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import {
  resolveClient,
  TransactionContextParams,
} from '@/core/repositories/transaction-context';
import {
  FetchLocationsFilterParams,
  LocationsRepository,
} from '@/domain/stock/application/repositories/locations-repository';
import { Location } from '@/domain/stock/enterprise/entities/location';

import { PrismaLocationMapper } from '../mappers/prisma-location-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaLocationsRepository implements LocationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    location: Location,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.location.create({
      data: PrismaLocationMapper.toPrisma(location),
    });
  }

  async findById(id: string): Promise<Location | null> {
    const location = await this.prisma.location.findUnique({ where: { id } });
    return location ? PrismaLocationMapper.toDomain(location) : null;
  }

  async findByCode(companyId: string, code: string): Promise<Location | null> {
    const location = await this.prisma.location.findFirst({
      where: {
        companyId,
        code: { equals: code, mode: 'insensitive' },
      },
    });

    return location ? PrismaLocationMapper.toDomain(location) : null;
  }

  async findByName(companyId: string, name: string): Promise<Location | null> {
    const location = await this.prisma.location.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return location ? PrismaLocationMapper.toDomain(location) : null;
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
    const where = this.buildWhere({ companyId, code, name, description });

    const [totalItems, locations] = await Promise.all([
      this.prisma.location.count({ where }),
      this.prisma.location.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
      }),
    ]);

    return {
      data: locations.map((location) =>
        PrismaLocationMapper.toDomain(location),
      ),
      meta: {
        totalItems,
        itemCount: locations.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    location: Location,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.location.update({
      where: { id: location.id.toString() },
      data: PrismaLocationMapper.toPrisma(location),
    });
  }

  async delete(id: string, options?: TransactionContextParams): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.location.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchLocationsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.location.deleteMany({
      where: this.buildWhere(filters),
    });
  }

  private buildWhere({
    companyId,
    code,
    name,
    description,
  }: FetchAllFilterParams): Prisma.LocationWhereInput {
    const where: Prisma.LocationWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };

    return where;
  }
}
