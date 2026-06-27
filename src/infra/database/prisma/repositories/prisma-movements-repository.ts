import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchMovementsFilterParams,
  MovementsRepository,
} from '@/domain/stock/application/repositories/movements-repository';
import { Movement } from '@/domain/stock/enterprise/entities/movement';

import { PrismaMovementMapper } from '../mappers/prisma-movement-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaMovementsRepository implements MovementsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    movement: Movement,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.movement.create({
      data: PrismaMovementMapper.toPrisma(movement),
    });
  }

  async findById(id: string): Promise<Movement | null> {
    const movement = await this.prisma.movement.findUnique({ where: { id } });
    return movement ? PrismaMovementMapper.toDomain(movement) : null;
  }

  async fetchAll(
    {
      companyId,
      addressingId,
      movementTypeId,
      userId,
      dateFrom,
      dateTo,
      minQuantity,
      maxQuantity,
      orderBy,
    }: FetchMovementsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: Movement[];
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
      addressingId,
      movementTypeId,
      userId,
      dateFrom,
      dateTo,
      minQuantity,
      maxQuantity,
    });

    const [totalItems, movements] = await Promise.all([
      this.prisma.movement.count({ where }),
      this.prisma.movement.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { date: 'desc' },
      }),
    ]);

    return {
      data: movements.map((m) => PrismaMovementMapper.toDomain(m)),
      meta: {
        totalItems,
        itemCount: movements.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.movement.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchMovementsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.movement.deleteMany({
      where: this.buildWhere(filters),
    });
  }

  private buildWhere({
    companyId,
    addressingId,
    movementTypeId,
    userId,
    dateFrom,
    dateTo,
    minQuantity,
    maxQuantity,
  }: Partial<FetchMovementsFilterParams>): Prisma.MovementWhereInput {
    const where: Prisma.MovementWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (addressingId) where.addressingId = addressingId;
    if (movementTypeId) where.movementTypeId = movementTypeId;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }
    if (minQuantity !== undefined || maxQuantity !== undefined) {
      where.quantity = {};
      if (minQuantity !== undefined) where.quantity.gte = minQuantity;
      if (maxQuantity !== undefined) where.quantity.lte = maxQuantity;
    }

    return where;
  }
}
