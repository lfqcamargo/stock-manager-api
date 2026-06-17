import { DomainEvents } from '@/core/events/domain-events';
import { CompaniesRepository } from '@/domain/user/application/repositories/companies-repository';
import { Company } from '@/domain/user/enterprise/entities/company';

export class InMemoryCompaniesRepository implements CompaniesRepository {
  public items: Company[] = [];

  async create(company: Company): Promise<void> {
    this.items.push(company);

    DomainEvents.dispatchEventsForAggregate(company.id);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Company | null> {
    const company = this.items.find((item) => item.id.toString() === id);
    return Promise.resolve(company ?? null);
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const company = this.items.find((item) => item.cnpj === cnpj);
    return Promise.resolve(company ?? null);
  }

  async update(company: Company): Promise<void> {
    const companyIndex = this.items.findIndex(
      (item) => item.id.toString() === company.id.toString(),
    );

    if (companyIndex >= 0) {
      this.items[companyIndex] = company;
    }

    DomainEvents.dispatchEventsForAggregate(company.id);

    return Promise.resolve();
  }
}
