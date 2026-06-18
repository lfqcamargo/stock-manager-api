import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
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

  async create(material: Material): Promise<void> {
    await this.prisma.material.create({
      data: PrismaMaterialMapper.toPrisma(material),
    });
  }

  async findById(companyId: string, id: string): Promise<Material | null> {
    const material = await this.prisma.material.findFirst({
      where: {
        id,
        companyId,
      },
    });

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
    const where: any = {
      companyId,
    };
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
        include: {
          group: true,
        },
      }),
      this.prisma.material.count({ where: { ...where, active: true } }),
      this.prisma.material.findFirst({
        where,
      }),
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
      where: {
        companyId,
        groupId,
      },
    });

    if (materials.length === 0) {
      return null;
    }

    return materials.map((material) => PrismaMaterialMapper.toDomain(material));
  }

  async update(material: Material): Promise<void> {
    await this.prisma.material.update({
      where: { id: material.id.toString() },
      data: PrismaMaterialMapper.toPrisma(material),
    });
  }

  async delete(material: Material): Promise<void> {
    await this.prisma.material.delete({
      where: { id: material.id.toString() },
    });
  }

  toDetails(material: any) {
    if (material instanceof MaterialDetails) return material;
    return MaterialDetails.create({
      companyId: material.companyId,
      groupId: material.groupId,
      group: material.group || '',
      id: material.id,
      code: material.code,
      name: material.name,
      description: material.description,
      unit: material.unit,
      active: material.active,
    });
  }
}
