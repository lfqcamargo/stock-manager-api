import { Repository } from '@/core/repositories/repository';
import { TransactionContextParams } from '@/core/repositories/transaction-context';

import { Company } from '../../enterprise/entities/company';

export abstract class CompaniesRepository extends Repository<Company> {
  abstract create(
    company: Company,
    options?: TransactionContextParams,
  ): Promise<void>;
  abstract findById(id: string): Promise<Company | null>;
  abstract findByCnpj(cnpj: string): Promise<Company | null>;
  abstract update(
    company: Company,
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
