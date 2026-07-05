import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  resolveClient,
  TransactionContextParams,
} from '@/core/repositories/transaction-context';
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
    options?: TransactionContextParams,
  ): Promise<void> {
    const client = resolveClient(this.prisma, options);
    await client.movement.create({
      data: PrismaMovementMapper.toPrisma(movement),
    });
  }

  async findById(id: string): Promise<Movement | null> {
    const movement = await this.prisma.movement.findUnique({ where: { id } });
    return movement ? PrismaMovementMapper.toDomain(movement) : null;
  }

  async fetchAll(
    filter: FetchMovementsFilterParams,
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
    const where = await this.buildWhere(filter);

    const [totalItems, movements] = await Promise.all([
      this.prisma.movement.count({ where }),
      this.prisma.movement.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: filter.orderBy
          ? { [filter.orderBy.field]: filter.orderBy.direction }
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
      where: await this.buildWhere(filters),
    });
  }

  private async buildWhere({
    companyId,
    addressingId,
    locationId,
    subLocationId,
    rowId,
    shelfId,
    positionId,
    materialId,
    movementTypeId,
    direction,
    userId,
    dateFrom,
    dateTo,
    minQuantity,
    maxQuantity,
  }: Partial<FetchMovementsFilterParams>): Promise<Prisma.MovementWhereInput> {
    const where: Prisma.MovementWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (movementTypeId) where.movementTypeId = movementTypeId;
    if (direction) where.movementTypeDirection = direction;
    if (userId) where.userId = userId;

    // Se filtros espaciais foram fornecidos, resolve os addressingIds via subquery
    const hasSpatialFilter =
      locationId ||
      subLocationId ||
      rowId ||
      shelfId ||
      positionId ||
      materialId;

    if (addressingId) {
      where.addressingId = addressingId;
    } else if (hasSpatialFilter && companyId) {
      const matchingAddressings = await this.prisma.addressing.findMany({
        where: {
          companyId,
          ...(locationId && { locationId }),
          ...(subLocationId && { subLocationId }),
          ...(rowId && { rowId }),
          ...(shelfId && { shelfId }),
          ...(positionId && { positionId }),
          ...(materialId && { materialId }),
        },
        select: { id: true },
      });
      where.addressingId = { in: matchingAddressings.map((a) => a.id) };
    }

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
