import { Injectable } from '@nestjs/common';

import { AggregateRoot } from '@/core/entities/aggregate-root';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { FetchAllFilterParams } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';
import { EmailsRepository } from '@/domain/notification/application/repositories/emails-repository';
import { Email } from '@/domain/notification/enterprise/entities/email';

import { PrismaEmailMapper } from '../mappers/prisma-email-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaEmailsRepository implements EmailsRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    email: Email,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.email.create({
      data: PrismaEmailMapper.toPrisma(email),
    });
  }

  async findById(id: string): Promise<Email | null> {
    const email = await this.prisma.email.findUnique({ where: { id } });
    return email ? PrismaEmailMapper.toDomain(email) : null;
  }

  async fetchAll(
    _filter: FetchAllFilterParams,
    { page, itemsPerPage }: PaginationParams,
    _options?: TransactionContextParams,
  ): Promise<{ data: AggregateRoot<any>[]; meta: Record<string, any> }> {
    const [totalItems, emails] = await Promise.all([
      this.prisma.email.count(),
      this.prisma.email.findMany({
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: emails.map((email) =>
        PrismaEmailMapper.toDomain(email),
      ) as unknown as AggregateRoot<any>[],
      meta: {
        totalItems,
        itemCount: emails.length,
        itemsPerPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        currentPage: page,
      },
    };
  }

  async delete(id: string, _options?: TransactionContextParams): Promise<void> {
    await this.prisma.email.delete({ where: { id } });
  }

  async deleteMany(
    _filters: FetchAllFilterParams,
    _options?: TransactionContextParams,
  ): Promise<void> {
    await this.prisma.email.deleteMany();
  }
}
