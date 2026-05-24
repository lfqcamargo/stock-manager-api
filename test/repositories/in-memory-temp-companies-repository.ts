import { DomainEvents } from '@/core/events/domain-events';
import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempCompany } from '@/domain/user/enterprise/entities/temp-company';

export class InMemoryTempCompaniesRepository implements TempCompaniesRepository {
  public items: TempCompany[] = [];

  async create(tempcompany: TempCompany): Promise<void> {
    this.items.push(tempcompany);

    DomainEvents.dispatchEventsForAggregate(tempcompany.id);
    return Promise.resolve();
  }

  async findByCnpj(companyCnpj: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find(
      (item) => item.companyCnpj === companyCnpj,
    );
    return Promise.resolve(tempcompany ?? null);
  }

  async findByEmail(userEmail: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find((item) => item.userEmail === userEmail);
    return Promise.resolve(tempcompany ?? null);
  }

  async findByToken(token: string): Promise<TempCompany | null> {
    const tempcompany = this.items.find((item) => item.token === token);
    return Promise.resolve(tempcompany ?? null);
  }

  async delete(tempcompany: TempCompany): Promise<void> {
    this.items = this.items.filter((item) => item.id !== tempcompany.id);
    return Promise.resolve();
  }
}
