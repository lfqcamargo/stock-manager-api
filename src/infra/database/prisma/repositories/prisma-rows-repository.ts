import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchRowsFilterParams,
  RowsRepository,
} from '@/domain/stock/application/repositories/rows-repository';
import { Row } from '@/domain/stock/enterprise/entities/row';

import { PrismaRowMapper } from '../mappers/prisma-row-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRowsRepository implements RowsRepository {
  constructor(private prisma: PrismaService) {}

  async create(row: Row, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.row.create({ data: PrismaRowMapper.toPrisma(row) });
  }

  async findById(id: string): Promise<Row | null> {
    const row = await this.prisma.row.findUnique({ where: { id } });
    return row ? PrismaRowMapper.toDomain(row) : null;
  }

  async findByCode(companyId: string, code: string): Promise<Row | null> {
    const row = await this.prisma.row.findFirst({
      where: {
        companyId,
        code: { equals: code, mode: 'insensitive' },
      },
    });

    return row ? PrismaRowMapper.toDomain(row) : null;
  }

  async findByName(companyId: string, name: string): Promise<Row | null> {
    const row = await this.prisma.row.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return row ? PrismaRowMapper.toDomain(row) : null;
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchRowsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ) {
    const where = this.buildWhere({ companyId, code, name, description });

    const [totalItems, rows] = await Promise.all([
      this.prisma.row.count({ where }),
      this.prisma.row.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
      }),
    ]);

    return {
      data: rows.map((row) => PrismaRowMapper.toDomain(row)),
      meta: {
        totalItems,
        itemCount: rows.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(row: Row, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.row.update({
      where: { id: row.id.toString() },
      data: PrismaRowMapper.toPrisma(row),
    });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.row.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchRowsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.row.deleteMany({ where: this.buildWhere(filters) });
  }

  private buildWhere({
    companyId,
    code,
    name,
    description,
  }: FetchAllFilterParams): Prisma.RowWhereInput {
    const where: Prisma.RowWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };

    return where;
  }
}
