import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { Company } from '@/domain/user/enterprise/entities/company';

import { UserRole } from '../../enterprise/entities/user';
import { CompaniesRepository } from '../repositories/companies-repository';
import { UsersRepository } from '../repositories/users-repository';
import { CompanyNotFoundError } from './errors/company-not-found-error';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface EditCompanyUseCaseRequest {
  companyId: string;
  authenticateUserId: string;
  name: string;
  photo: string | null;
}

type EditCompanyUseCaseResponse = Either<
  CompanyNotFoundError | UserNotFoundError | UserNotAdminError,
  {
    company: Company;
  }
>;

@Injectable()
export class EditCompanyUseCase {
  constructor(
    private readonly _companiesRepository: CompaniesRepository,
    private readonly _usersRepository: UsersRepository,
  ) {}

  async execute({
    companyId,
    authenticateUserId,
    name,
    photo,
  }: EditCompanyUseCaseRequest): Promise<EditCompanyUseCaseResponse> {
    const company = await this._companiesRepository.findById(companyId);
    if (!company) return left(new CompanyNotFoundError());

    const user = await this._usersRepository.findById(authenticateUserId);
    if (!user) return left(new UserNotFoundError());

    if (user.companyId.toString() !== companyId)
      return left(new CompanyNotFoundError());
    if (user.role !== UserRole.ADMIN) return left(new UserNotAdminError());

    company.updateName(name);
    if (photo !== undefined) {
      company.updatePhoto(photo);
    }

    await this._companiesRepository.update(company);

    return right({ company });
  }
}
