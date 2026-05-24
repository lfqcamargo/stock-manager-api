import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempCompany } from '@/domain/user/enterprise/entities/temp-company';

import { PrismaTempCompanyMapper } from '../mappers/prisma-temp-company-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTempCompaniesRepository implements TempCompaniesRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(tempcompany: TempCompany): Promise<void> {
    await this._prisma.tempCompany.create({
      data: PrismaTempCompanyMapper.toPrisma(tempcompany),
    });

    DomainEvents.dispatchEventsForAggregate(tempcompany.id);
  }

  async findById(id: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { id },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async findByCnpj(companyCnpj: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { companyCnpj },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async findByEmail(userEmail: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { userEmail },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async findByToken(token: string): Promise<TempCompany | null> {
    const tempcompany = await this._prisma.tempCompany.findUnique({
      where: { token },
    });
    return tempcompany ? PrismaTempCompanyMapper.toDomain(tempcompany) : null;
  }

  async delete(tempcompany: TempCompany): Promise<void> {
    await this._prisma.tempCompany.delete({
      where: { id: tempcompany.id.toString() },
    });
  }
}
