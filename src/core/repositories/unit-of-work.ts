import { TransactionContext } from './transaction-context';

export abstract class UnitOfWork {
  abstract execute<T>(
    work: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
