import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { Company } from '../../enterprise/entities/company';
import { CompaniesRepository } from '../repositories/companies-repository';
import { UsersRepository } from '../repositories/users-repository';
import { CompanyNotFoundError } from './errors/company-not-found-error';
import { UserNotFoundError } from './errors/user-not-found-error';

interface GetProfileCompanyUseCaseRequest {
  companyId: string;
  userAuthenticateId: string;
}

type GetProfileCompanyUseCaseResponse = Either<
  UserNotFoundError | CompanyNotFoundError,
  {
    company: Company;
  }
>;

@Injectable()
export class GetProfileCompanyUseCase {
  constructor(
    private readonly _companiesRepository: CompaniesRepository,
    private readonly _usersRepository: UsersRepository,
  ) {}

  async execute({
    companyId,
    userAuthenticateId,
  }: GetProfileCompanyUseCaseRequest): Promise<GetProfileCompanyUseCaseResponse> {
    const userAuthenticate =
      await this._usersRepository.findById(userAuthenticateId);
    if (!userAuthenticate) return left(new UserNotFoundError());

    const company = await this._companiesRepository.findById(companyId);
    if (!company) return left(new CompanyNotFoundError());
    if (userAuthenticate.companyId.toString() !== companyId)
      return left(new CompanyNotFoundError());

    return right({
      company,
    });
  }
}
