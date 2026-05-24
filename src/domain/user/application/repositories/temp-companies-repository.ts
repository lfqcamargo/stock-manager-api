import { TempCompany } from '../../enterprise/entities/temp-company';

export abstract class TempCompaniesRepository {
  abstract create(tempcompany: TempCompany): Promise<void>;
  abstract findByCnpj(companyCnpj: string): Promise<TempCompany | null>;
  abstract findByEmail(userEmail: string): Promise<TempCompany | null>;
  abstract findByToken(token: string): Promise<TempCompany | null>;
  abstract delete(tempcompany: TempCompany): Promise<void>;
}
