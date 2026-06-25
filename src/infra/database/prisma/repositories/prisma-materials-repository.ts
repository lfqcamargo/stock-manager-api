import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import {
  FetchMaterialsFilterParams,
  MaterialsRepository,
} from '@/domain/stock/application/repositories/materials-repository';
import { Material } from '@/domain/stock/enterprise/entities/material';
import { MaterialDetails } from '@/domain/stock/enterprise/entities/value-objects/material-details';

import { PrismaMaterialDetailsMapper } from '../mappers/prisma-material-details-mapper';
import { PrismaMaterialMapper } from '../mappers/prisma-material-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaMaterialsRepository implements MaterialsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    material: Material,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.material.create({
      data: PrismaMaterialMapper.toPrisma(material),
    });
  }

  async findById(id: string): Promise<Material | null> {
    const material = await this.prisma.material.findUnique({ where: { id } });
    return material ? PrismaMaterialMapper.toDomain(material) : null;
  }

  async findByCode(companyId: string, code: string): Promise<Material | null> {
    const material = await this.prisma.material.findFirst({
      where: {
        companyId,
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
    });

    return material ? PrismaMaterialMapper.toDomain(material) : null;
  }

  async findByName(companyId: string, name: string): Promise<Material | null> {
    const material = await this.prisma.material.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return material ? PrismaMaterialMapper.toDomain(material) : null;
  }

  async fetchAll(
    {
      companyId,
      groupId,
      code,
      name,
      description,
      active,
      orderBy,
    }: FetchMaterialsFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{
    data: MaterialDetails[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveMaterials: number;
    };
  }> {
    const where: any = { companyId };
    if (groupId) where.groupId = groupId;
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };
    if (active !== undefined) where.active = active;

    const orderByClause: any = orderBy
      ? orderBy.field === 'groupId'
        ? { group: { name: orderBy.direction } }
        : { [orderBy.field]: orderBy.direction }
      : { name: 'asc' };

    const [totalItems, materials, totalActiveMaterials] = await Promise.all([
      this.prisma.material.count({ where }),
      this.prisma.material.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderByClause,
        include: { group: true },
      }),
      this.prisma.material.count({ where: { ...where, active: true } }),
    ]);

    return {
      data: materials.map((material) =>
        PrismaMaterialDetailsMapper.toDomain(material),
      ),
      meta: {
        totalItems,
        itemCount: materials.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
        totalActiveMaterials,
      },
    };
  }

  async fetchByGroupId(
    companyId: string,
    groupId: string,
  ): Promise<Material[] | null> {
    const materials = await this.prisma.material.findMany({
      where: { companyId, groupId },
    });

    if (materials.length === 0) {
      return null;
    }

    return materials.map((material) => PrismaMaterialMapper.toDomain(material));
  }

  async update(
    material: Material,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.material.update({
      where: { id: material.id.toString() },
      data: PrismaMaterialMapper.toPrisma(material),
    });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.material.delete({ where: { id } });
  }

  async deleteMany(
    filters: FetchMaterialsFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const where: any = {};

    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.groupId) where.groupId = filters.groupId;
    if (filters.code)
      where.code = { contains: filters.code, mode: 'insensitive' };
    if (filters.name)
      where.name = { contains: filters.name, mode: 'insensitive' };
    if (filters.description)
      where.description = {
        contains: filters.description,
        mode: 'insensitive',
      };
    if (filters.active !== undefined) where.active = filters.active;

    await this.prisma.material.deleteMany({ where });
  }
}
