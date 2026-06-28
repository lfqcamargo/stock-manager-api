import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  resolveClient,
  TransactionContextParams,
} from '@/core/repositories/transaction-context';
import {
  FetchSubLocationsFilterParams,
  SubLocationsRepository,
} from '@/domain/stock/application/repositories/sub-locations-repository';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { SubLocationDetails } from '@/domain/stock/enterprise/entities/value-objects/sub-location-details';

import { PrismaSubLocationDetailsMapper } from '../mappers/prisma-sub-location-details-mapper';
import { PrismaSubLocationMapper } from '../mappers/prisma-sub-location-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSubLocationsRepository implements SubLocationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    sublocation: SubLocation,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.subLocation.create({
      data: PrismaSubLocationMapper.toPrisma(sublocation),
    });
  }

  async findById(id: string): Promise<SubLocation | null> {
    const sublocation = await this.prisma.subLocation.findUnique({
      where: { id },
    });

    return sublocation ? PrismaSubLocationMapper.toDomain(sublocation) : null;
  }

  async findByCode(
    companyId: string,
    code: string,
  ): Promise<SubLocation | null> {
    const sublocation = await this.prisma.subLocation.findFirst({
      where: {
        companyId,
        code: { equals: code, mode: 'insensitive' },
      },
    });

    return sublocation ? PrismaSubLocationMapper.toDomain(sublocation) : null;
  }

  async findByName(
    companyId: string,
    locationId: string,
    name: string,
  ): Promise<SubLocation | null> {
    const sublocation = await this.prisma.subLocation.findFirst({
      where: {
        companyId,
        locationId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return sublocation ? PrismaSubLocationMapper.toDomain(sublocation) : null;
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
    const where = this.buildWhere({
      companyId,
      locationId,
      code,
      name,
      description,
    });

    const [totalItems, sublocations] = await Promise.all([
      this.prisma.subLocation.count({ where }),
      this.prisma.subLocation.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
        include: { location: true },
      }),
    ]);

    return {
      data: sublocations.map((sublocation) =>
        PrismaSubLocationDetailsMapper.toDomain(sublocation),
      ),
      meta: {
        totalItems,
        itemCount: sublocations.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    sublocation: SubLocation,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.subLocation.update({
      where: { id: sublocation.id.toString() },
      data: PrismaSubLocationMapper.toPrisma(sublocation),
    });
  }

  async delete(id: string, options?: TransactionContextParams): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.subLocation.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchSubLocationsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.subLocation.deleteMany({
      where: this.buildWhere(filters),
    });
  }

  private buildWhere({
    companyId,
    locationId,
    code,
    name,
    description,
  }: FetchSubLocationsFilterParams): Prisma.SubLocationWhereInput {
    const where: Prisma.SubLocationWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (locationId) where.locationId = locationId;
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };

    return where;
  }
}
