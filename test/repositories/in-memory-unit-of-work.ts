import { TransactionContext } from '@/core/repositories/transaction-context';
import { UnitOfWork } from '@/core/repositories/unit-of-work';

export class InMemoryUnitOfWork implements UnitOfWork {
  async execute<T>(
    work: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return work(null);
  }
}
