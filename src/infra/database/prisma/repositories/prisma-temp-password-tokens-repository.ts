import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { TempPasswordTokensRepository } from '@/domain/user/application/repositories/temp-password-tokens-repository';
import { TempPasswordToken } from '@/domain/user/enterprise/entities/temp-password-token';

import { PrismaTempPasswordTokensMapper } from '../mappers/prisma-temp-password-tokens-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTempPasswordTokensRepository implements TempPasswordTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    tempTokenPassword: TempPasswordToken,
    _options?: TransactionContextParams,
  ): Promise<void> {
    const prismaPasswordToken =
      PrismaTempPasswordTokensMapper.toPrisma(tempTokenPassword);
    await this.prisma.tempPasswordToken.create({ data: prismaPasswordToken });

    DomainEvents.dispatchEventsForAggregate(tempTokenPassword.id);
  }

  async findById(id: string): Promise<TempPasswordToken | null> {
    const prismaPasswordToken = await this.prisma.tempPasswordToken.findUnique({
      where: { id },
    });

    if (!prismaPasswordToken) {
      return null;
    }

    return PrismaTempPasswordTokensMapper.toDomain(prismaPasswordToken);
  }

  async findByToken(token: string): Promise<TempPasswordToken | null> {
    const prismaPasswordToken = await this.prisma.tempPasswordToken.findUnique({
      where: { token },
    });

    if (!prismaPasswordToken) {
      return null;
    }

    return PrismaTempPasswordTokensMapper.toDomain(prismaPasswordToken);
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: TempPasswordToken[]; meta: Record<string, any> }> {
    const [totalItems, tokens] = await Promise.all([
      this.prisma.tempPasswordToken.count(),
      this.prisma.tempPasswordToken.findMany({
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { expirationDate: 'desc' },
      }),
    ]);

    return {
      data: tokens.map((token) =>
        PrismaTempPasswordTokensMapper.toDomain(token),
      ),
      meta: {
        totalItems,
        itemCount: tokens.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async deleteByToken(
    token: string,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.tempPasswordToken.delete({ where: { token } });
  }

  async deleteByUserId(
    userId: string,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.tempPasswordToken.deleteMany({ where: { userId } });
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.tempPasswordToken.delete({ where: { id } });
  }

  async deleteMany(
    _filters: FetchAllFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.tempPasswordToken.deleteMany();
  }
}
