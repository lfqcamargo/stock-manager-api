import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import {
  resolveClient,
  TransactionContextParams,
} from '@/core/repositories/transaction-context';
import {
  FetchPositionsFilterParams,
  PositionsRepository,
} from '@/domain/stock/application/repositories/positions-repository';
import { Position } from '@/domain/stock/enterprise/entities/position';

import { PrismaPositionMapper } from '../mappers/prisma-position-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPositionsRepository implements PositionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    position: Position,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.position.create({
      data: PrismaPositionMapper.toPrisma(position),
    });
  }

  async findById(id: string): Promise<Position | null> {
    const position = await this.prisma.position.findUnique({ where: { id } });
    return position ? PrismaPositionMapper.toDomain(position) : null;
  }

  async findByCode(companyId: string, code: string): Promise<Position | null> {
    const position = await this.prisma.position.findFirst({
      where: {
        companyId,
        code: { equals: code, mode: 'insensitive' },
      },
    });

    return position ? PrismaPositionMapper.toDomain(position) : null;
  }

  async findByName(companyId: string, name: string): Promise<Position | null> {
    const position = await this.prisma.position.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    return position ? PrismaPositionMapper.toDomain(position) : null;
  }

  async fetchAll(
    { companyId, code, name, description, orderBy }: FetchPositionsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ) {
    const where = this.buildWhere({ companyId, code, name, description });

    const [totalItems, positions] = await Promise.all([
      this.prisma.position.count({ where }),
      this.prisma.position.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
      }),
    ]);

    return {
      data: positions.map((position) =>
        PrismaPositionMapper.toDomain(position),
      ),
      meta: {
        totalItems,
        itemCount: positions.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    position: Position,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.position.update({
      where: { id: position.id.toString() },
      data: PrismaPositionMapper.toPrisma(position),
    });
  }

  async delete(id: string, options?: TransactionContextParams): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.position.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchPositionsFilterParams,
    options?: TransactionContextParams,
  ): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.position.deleteMany({ where: this.buildWhere(filters) });
  }

  private buildWhere({
    companyId,
    code,
    name,
    description,
  }: FetchAllFilterParams): Prisma.PositionWhereInput {
    const where: Prisma.PositionWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };

    return where;
  }
}
