import { Repository } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';

import { TempCompany } from '../../enterprise/entities/temp-company';

export abstract class TempCompaniesRepository extends Repository<TempCompany> {
  abstract create(
    tempcompany: TempCompany,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<TempCompany | null>;
  abstract findByCnpj(companyCnpj: string): Promise<TempCompany | null>;
  abstract findByEmail(userEmail: string): Promise<TempCompany | null>;
  abstract findByToken(token: string): Promise<TempCompany | null>;
  abstract delete(
    id: string,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract deleteMany(
    filters: any,
    options?: TransactionContextParams,
  ): Promise<void>;
}
