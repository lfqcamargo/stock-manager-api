import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchGroupsFilterParams,
  GroupsRepository,
} from '@/domain/stock/application/repositories/groups-repository';
import { Group } from '@/domain/stock/enterprise/entities/group';

import { PrismaGroupMapper } from '../mappers/prisma-group-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaGroupsRepository implements GroupsRepository {
  constructor(private prisma: PrismaService) {}

  async create(group: Group): Promise<void> {
    await this.prisma.group.create({
      data: PrismaGroupMapper.toPrisma(group),
    });
  }

  async findById(companyId: string, id: string): Promise<Group | null> {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        companyId,
      },
    });

    return group ? PrismaGroupMapper.toDomain(group) : null;
  }

  async findByCode(companyId: string, code: string): Promise<Group | null> {
    const group = await this.prisma.group.findFirst({
      where: {
        companyId,
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
    });

    return group ? PrismaGroupMapper.toDomain(group) : null;
  }

  async findByName(companyId: string, name: string): Promise<Group | null> {
    const group = await this.prisma.group.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return group ? PrismaGroupMapper.toDomain(group) : null;
  }

  async fetchAll(
    {
      companyId,
      code,
      name,
      description,
      active,
      orderBy,
    }: FetchGroupsFilterParams,
    { page, itemsPerPage }: PaginationParams,
  ): Promise<{
    data: Group[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalActiveGroups: number;
      totalEmptyGroups: number;
    };
  }> {
    const where: any = { companyId };
    if (code) where.code = { contains: code, mode: 'insensitive' };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description)
      where.description = { contains: description, mode: 'insensitive' };
    if (active !== undefined) where.active = active;

    const [totalItems, groups, totalActiveGroups] = await Promise.all([
      this.prisma.group.count({ where }),
      this.prisma.group.findMany({
        where,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: orderBy
          ? { [orderBy.field]: orderBy.direction }
          : { name: 'asc' },
      }),
      this.prisma.group.count({ where: { ...where, active: true } }),
    ]);

    const groupsWithMaterial = await this.prisma.material.groupBy({
      by: ['groupId'],
      where: { companyId },
    });

    const allGroupIds = await this.prisma.group.findMany({
      where: { companyId },
      select: { id: true },
    });

    const groupIdsWithMaterial = new Set(
      groupsWithMaterial.map((g) => g.groupId),
    );
    const totalEmptyGroups = allGroupIds.filter(
      (group) => !groupIdsWithMaterial.has(group.id),
    ).length;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      data: groups.map((group) => PrismaGroupMapper.toDomain(group)),
      meta: {
        totalItems,
        itemCount: groups.length,
        itemsPerPage,
        totalPages,
        currentPage: page,
        totalActiveGroups,
        totalEmptyGroups,
      },
    };
  }

  async update(group: Group): Promise<void> {
    await this.prisma.group.update({
      where: { id: group.id.toString() },
      data: PrismaGroupMapper.toPrisma(group),
    });
  }

  async delete(group: Group): Promise<void> {
    await this.prisma.group.delete({
      where: { id: group.id.toString() },
    });
  }
}
