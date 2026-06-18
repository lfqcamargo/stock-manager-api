import { Prisma } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

import { PaginationParams } from '@/core/repositories/pagination-params';
import {
  FetchUsersFilterParams,
  UsersRepository,
} from '@/domain/user/application/repositories/users-repository';
import { User, UserRole } from '@/domain/user/enterprise/entities/user';

import { PrismaUserMapper } from '../mappers/prisma-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this._prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this._prisma.user.findUnique({
      where: { email },
    });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this._prisma.user.findUnique({
      where: { id },
    });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async fetchAll(
    {
      companyId,
      email,
      name,
      role,
      active,
      createdAtStart,
      createdAtEnd,
      lastLogin,
    }: FetchUsersFilterParams,
    { page, itemsPerPage }: PaginationParams,
  ): Promise<{
    data: User[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
      totalAdmin: number;
      totalMaanger: number;
      totalEmployee: number;
      totalActive: number;
      totalInactive: number;
      lastCreated: Date;
    };
  }> {
    const whereClause: Prisma.UserWhereInput = {
      companyId,
    };

    if (email) {
      whereClause.email = { contains: email, mode: 'insensitive' };
    }

    if (name) {
      whereClause.name = { contains: name, mode: 'insensitive' };
    }

    if (role) {
      whereClause.role = role;
    }

    if (active !== undefined) {
      whereClause.active = active;
    }

    if (createdAtStart || createdAtEnd) {
      whereClause.createdAt = {};
      if (createdAtStart) {
        whereClause.createdAt.gte = createdAtStart;
      }
      if (createdAtEnd) {
        whereClause.createdAt.lte = createdAtEnd;
      }
    }

    if (lastLogin) {
      whereClause.lastLogin = { gte: lastLogin };
    }

    const users = await this._prisma.user.findMany({
      where: whereClause,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: { createdAt: 'desc' },
    });

    const totalItems = await this._prisma.user.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const totalAdmin = await this._prisma.user.count({
      where: { companyId, role: UserRole.ADMIN },
    });

    const totalMaanger = await this._prisma.user.count({
      where: { companyId, role: UserRole.MANAGER },
    });

    const totalEmployee = await this._prisma.user.count({
      where: { companyId, role: UserRole.EMPLOYEE },
    });

    const totalActive = await this._prisma.user.count({
      where: { companyId, active: true },
    });

    const totalInactive = totalItems - totalActive;

    const lastCreatedRecord = await this._prisma.user.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    const lastCreated = lastCreatedRecord?.createdAt || new Date();

    return {
      data: users.map((user) => PrismaUserMapper.toDomain(user)),
      meta: {
        totalItems,
        itemCount: users.length,
        itemsPerPage,
        totalPages,
        currentPage: page,
        totalAdmin,
        totalMaanger,
        totalEmployee,
        totalActive,
        totalInactive,
        lastCreated,
      },
    };
  }

  async update(user: User): Promise<void> {
    await this._prisma.user.update({
      where: { id: user.id.toString() },
      data: PrismaUserMapper.toPrisma(user),
    });
  }

  async delete(user: User): Promise<void> {
    await this._prisma.user.delete({
      where: { id: user.id.toString() },
    });

    return Promise.resolve();
  }
}
