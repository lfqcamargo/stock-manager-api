import { Repository } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';

import { TempUser } from '../../enterprise/entities/temp-user';

export abstract class TempUsersRepository extends Repository<TempUser> {
  abstract create(
    tempuser: TempUser,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<TempUser | null>;
  abstract findByEmail(email: string): Promise<TempUser | null>;
  abstract findByToken(token: string): Promise<TempUser | null>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: any,
    options?: TransactionContextParams,
  ): Promise<void>;
}
