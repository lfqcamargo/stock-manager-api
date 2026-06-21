import { Company } from '@/domain/user/enterprise/entities/company';

export class CompanyPresenter {
  static toHTTP(company: Company) {
    return {
      id: company.id.toString(),
      name: company.name,
      cnpj: company.cnpj,
      photoUrl: company.photoUrl,
      createdAt: company.createdAt?.toISOString() ?? null,
      updatedAt: company.updatedAt?.toISOString() ?? null,
    };
  }
}
