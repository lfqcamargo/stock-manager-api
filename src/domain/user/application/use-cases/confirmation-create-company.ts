import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { Company } from '../../enterprise/entities/company';
import { User, UserRole } from '../../enterprise/entities/user';
import { CompaniesRepository } from '../repositories/companies-repository';
import { TempCompaniesRepository } from '../repositories/temp-companies-repository';
import { UsersRepository } from '../repositories/users-repository';
import { AlreadyExistsCnpjError } from './errors/already-exists-cnpj-error';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';
import { ResourceTokenNotFoundError } from './errors/resource-token-not-found-error';
import { TokenExpiratedError } from './errors/token-expirated-error';

interface ConfirmationCreateUserUseCaseRequest {
  token: string;
}

type ConfirmationCreateUserUseCaseResponse = Either<
  | AlreadyExistsCnpjError
  | ResourceTokenNotFoundError
  | AlreadyExistsEmailError
  | TokenExpiratedError,
  {
    email: string;
  }
>;

@Injectable()
export class ConfirmationCreateUserUseCase {
  constructor(
    private readonly _tempCompaniesRepository: TempCompaniesRepository,
    private readonly _companiesRepository: CompaniesRepository,
    private readonly _usersRepository: UsersRepository,
  ) {}

  async execute({
    token,
  }: ConfirmationCreateUserUseCaseRequest): Promise<ConfirmationCreateUserUseCaseResponse> {
    const tempCompany = await this._tempCompaniesRepository.findByToken(token);
    if (!tempCompany) return left(new ResourceTokenNotFoundError());

    const alreadyExistsCnpj = await this._companiesRepository.findByCnpj(
      tempCompany.companyCnpj,
    );
    if (alreadyExistsCnpj) return left(new AlreadyExistsCnpjError());

    const alreadyExistsEmail = await this._usersRepository.findByEmail(
      tempCompany.userEmail,
    );
    if (alreadyExistsEmail) return left(new AlreadyExistsEmailError());

    if (tempCompany.expirationDate < new Date()) {
      return left(new TokenExpiratedError());
    }

    const company = Company.create({
      cnpj: tempCompany.companyCnpj,
      name: tempCompany.companyName,
    });

    const user = User.create({
      name: tempCompany.userName,
      email: tempCompany.userEmail,
      password: tempCompany.userPassword,
      role: UserRole.ADMIN,
      active: true,
      companyId: company.id,
    });

    company.users.push(user);

    await this._companiesRepository.create(company);
    await this._tempCompaniesRepository.delete(tempCompany);

    return right({ email: user.email });
  }
}
