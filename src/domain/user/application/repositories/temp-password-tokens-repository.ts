import { Repository } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';

import { TempPasswordToken } from '../../enterprise/entities/temp-password-token';

export abstract class TempPasswordTokensRepository extends Repository<TempPasswordToken> {
  abstract create(
    data: TempPasswordToken,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<TempPasswordToken | null>;
  abstract findByToken(token: string): Promise<TempPasswordToken | null>;
  abstract deleteByToken(
    token: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteByUserId(
    userId: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: any,
    options?: TransactionContextParams,
  ): Promise<void>;
}
