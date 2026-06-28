import { Injectable } from '@nestjs/common';

import { TransactionContext } from '@/core/repositories/transaction-context';
import { UnitOfWork } from '@/core/repositories/unit-of-work';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  execute<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => work(tx));
  }
}
