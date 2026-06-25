import { Repository } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';

import { Email } from '../../enterprise/entities/email';

export abstract class EmailsRepository extends Repository<Email> {
  abstract create(
    email: Email,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Email | null>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: any,
    options?: TransactionContextParams,
  ): Promise<void>;
}
