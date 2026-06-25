import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { TempUsersRepository } from '@/domain/user/application/repositories/temp-users-repository';
import { TempUser } from '@/domain/user/enterprise/entities/temp-user';

import { PrismaTempUserMapper } from '../mappers/prisma-temp-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTempUsersRepository implements TempUsersRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(
    tempuser: TempUser,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.tempUser.create({
      data: PrismaTempUserMapper.toPrisma(tempuser),
    });

    DomainEvents.dispatchEventsForAggregate(tempuser.id);
  }

  async findById(id: string): Promise<TempUser | null> {
    const tempuser = await this._prisma.tempUser.findUnique({ where: { id } });
    return tempuser ? PrismaTempUserMapper.toDomain(tempuser) : null;
  }

  async findByEmail(email: string): Promise<TempUser | null> {
    const tempuser = await this._prisma.tempUser.findUnique({
      where: { email },
    });
    return tempuser ? PrismaTempUserMapper.toDomain(tempuser) : null;
  }

  async findByToken(token: string): Promise<TempUser | null> {
    const tempuser = await this._prisma.tempUser.findUnique({
      where: { token },
    });
    return tempuser ? PrismaTempUserMapper.toDomain(tempuser) : null;
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: TempUser[]; meta: Record<string, any> }> {
    const [totalItems, tempUsers] = await Promise.all([
      this._prisma.tempUser.count(),
      this._prisma.tempUser.findMany({
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { expirationDate: 'desc' },
      }),
    ]);

    return {
      data: tempUsers.map((tempuser) =>
        PrismaTempUserMapper.toDomain(tempuser),
      ),
      meta: {
        totalItems,
        itemCount: tempUsers.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this._prisma.tempUser.delete({ where: { id } });
  }

  async deleteMany(
    _filters: FetchAllFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this._prisma.tempUser.deleteMany();
  }
}
