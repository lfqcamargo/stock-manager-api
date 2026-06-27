import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchMovementTypesFilterParams,
  MovementTypesRepository,
} from '@/domain/stock/application/repositories/movement-types-repository';
import { MovementType } from '@/domain/stock/enterprise/entities/movement-type';

import { PrismaMovementTypeMapper } from '../mappers/prisma-movement-type-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaMovementTypesRepository implements MovementTypesRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    movementType: MovementType,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.movementType.create({
      data: PrismaMovementTypeMapper.toPrisma(movementType),
    });
  }

  async findById(id: string): Promise<MovementType | null> {
    const movementType = await this.prisma.movementType.findUnique({
      where: { id },
    });
    return movementType
      ? PrismaMovementTypeMapper.toDomain(movementType)
      : null;
  }

  async findByName(
    companyId: string,
    name: string,
  ): Promise<MovementType | null> {
    const movementType = await this.prisma.movementType.findFirst({
      where: {
        companyId,
        name: { equals: name, mode: 'insensitive' },
      },
    });
    return movementType
      ? PrismaMovementTypeMapper.toDomain(movementType)
      : null;
  }

  async fetchAll(
    { companyId, name, direction, orderBy }: FetchMovementTypesFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: MovementType[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    const where = this.buildWhere({ companyId, name, direction });

    const [totalItems, movementTypes] = await Promise.all([
      this.prisma.movementType.count({ where }),
      this.prisma.movementType.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
      }),
    ]);

    return {
      data: movementTypes.map((mt) => PrismaMovementTypeMapper.toDomain(mt)),
      meta: {
        totalItems,
        itemCount: movementTypes.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async update(
    movementType: MovementType,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.movementType.update({
      where: { id: movementType.id.toString() },
      data: PrismaMovementTypeMapper.toPrisma(movementType),
    });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.movementType.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchMovementTypesFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.movementType.deleteMany({
      where: this.buildWhere(filters),
    });
  }

  private buildWhere({
    companyId,
    name,
    direction,
  }: Partial<FetchMovementTypesFilterParams>): Prisma.MovementTypeWhereInput {
    const where: Prisma.MovementTypeWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (direction) where.direction = direction;

    return where;
  }
}
