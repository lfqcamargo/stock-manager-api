import { Company } from '../../enterprise/entities/company';

export abstract class CompaniesRepository {
  abstract create(company: Company): Promise<void>;
  abstract findById(id: string): Promise<Company | null>;
  abstract findByCnpj(cnpj: string): Promise<Company | null>;
  abstract update(company: Company): Promise<void>;
}
