import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';

import { HashGenerator } from '../../../shared/application/cryptography/hash-generator';
import { TempCompany } from '../../enterprise/entities/temp-company';
import { CompaniesRepository } from '../repositories/companies-repository';
import { TempCompaniesRepository } from '../repositories/temp-companies-repository';
import { UsersRepository } from '../repositories/users-repository';
import { AlreadyExistsCnpjError } from './errors/already-exists-cnpj-error';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';

interface CreateTempCompanyUseCaseRequest {
  companyName: string;
  companyCnpj: string;

  userName: string;
  userEmail: string;
  userPassword: string;
}

type CreateTempCompanyUseCaseResponse = Either<
  AlreadyExistsCnpjError | AlreadyExistsEmailError,
  { tempCompany: TempCompany }
>;

@Injectable()
export class CreateTempCompanyUseCase {
  constructor(
    private readonly _tempCompaniesRepository: TempCompaniesRepository,
    private readonly _companiesRepository: CompaniesRepository,
    private readonly _usersRepository: UsersRepository,
    private readonly _hashGenerator: HashGenerator,
  ) {}

  async execute({
    companyName,
    companyCnpj,
    userName,
    userEmail,
    userPassword,
  }: CreateTempCompanyUseCaseRequest): Promise<CreateTempCompanyUseCaseResponse> {
    const companyCnpjExists =
      await this._companiesRepository.findByCnpj(companyCnpj);

    if (companyCnpjExists) return left(new AlreadyExistsCnpjError());

    const userEmailExists = await this._usersRepository.findByEmail(userEmail);
    if (userEmailExists) return left(new AlreadyExistsEmailError());

    const tempCompanyCnpj =
      await this._tempCompaniesRepository.findByCnpj(companyCnpj);
    if (tempCompanyCnpj)
      await this._tempCompaniesRepository.delete(tempCompanyCnpj.id.toString());

    const tempCompanyEmail =
      await this._tempCompaniesRepository.findByEmail(userEmail);
    if (tempCompanyEmail)
      await this._tempCompaniesRepository.delete(
        tempCompanyEmail.id.toString(),
      );

    const hashedPassword = await this._hashGenerator.hash(userPassword);

    const tempCompany = TempCompany.create({
      companyCnpj,
      companyName,
      userEmail,
      userName,
      userPassword: hashedPassword,
    });

    await this._tempCompaniesRepository.create(tempCompany);

    return right({ tempCompany });
  }
}
