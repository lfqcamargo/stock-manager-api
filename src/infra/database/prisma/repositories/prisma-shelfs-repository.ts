import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import {
  resolveClient,
  TransactionContextParams,
} from '@/core/repositories/transaction-context';
import {
  FetchShelfsFilterParams,
  ShelfsRepository,
} from '@/domain/stock/application/repositories/shelfs-repository';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';

import { PrismaShelfMapper } from '../mappers/prisma-shelf-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaShelfsRepository implements ShelfsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    shelf: Shelf,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.shelf.create({ data: PrismaShelfMapper.toPrisma(shelf) });
  }

  async findById(id: string): Promise<Shelf | null> {
    const shelf = await this.prisma.shelf.findUnique({ where: { id } });
    return shelf ? PrismaShelfMapper.toDomain(shelf) : null;
  }

  async findByCode(companyId: string, code: string): Promise<Shelf | null> {
    const shelf = await this.prisma.shelf.findFirst({
      where: {
        companyId,
        code: { equals: code, mode: 'insensitive' },
      },
    });

    return shelf ? PrismaShelfMapper.toDomain(shelf) : null;
  }

  async findByName(companyId: string, name: string): Promise<Shelf | null> {
    const shelf = await this.prisma.shelf.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return shelf ? PrismaShelfMapper.toDomain(shelf) : null;
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchShelfsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ) {
    const where = this.buildWhere({ companyId, code, name, description });

    const [totalItems, shelfs] = await Promise.all([
      this.prisma.shelf.count({ where }),
      this.prisma.shelf.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
      }),
    ]);

    return {
      data: shelfs.map((shelf) => PrismaShelfMapper.toDomain(shelf)),
      meta: {
        totalItems,
        itemCount: shelfs.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    shelf: Shelf,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.shelf.update({
      where: { id: shelf.id.toString() },
      data: PrismaShelfMapper.toPrisma(shelf),
    });
  }

  async delete(id: string, options?: TransactionContextParams): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.shelf.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchShelfsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.shelf.deleteMany({ where: this.buildWhere(filters) });
  }

  private buildWhere({
    companyId,
    code,
    name,
    description,
  }: FetchAllFilterParams): Prisma.ShelfWhereInput {
    const where: Prisma.ShelfWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };

    return where;
  }
}
