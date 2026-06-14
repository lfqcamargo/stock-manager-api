import { makeCompany } from 'test/factories/make-company';
import { makeUser } from 'test/factories/make-user';
import { InMemoryCompaniesRepository } from 'test/repositories/in-memory-companies-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { CompanyNotFoundError } from './errors/company-not-found-error';
import { UserNotFoundError } from './errors/user-not-found-error';
import { GetProfileCompanyUseCase } from './get-profile-company';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let sut: GetProfileCompanyUseCase;

describe('Get profile company', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository();
    sut = new GetProfileCompanyUseCase(
      inMemoryCompaniesRepository,
      inMemoryUsersRepository,
    );
  });

  it('should return the company profile when user is authenticated and belongs to the company', async () => {
    const company = makeCompany();
    await inMemoryCompaniesRepository.create(company);

    const user = makeUser({ companyId: company.id });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      companyId: company.id.toString(),
      userAuthenticateId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.company.id).toEqual(company.id);
    }
  });

  it('should return UserNotFoundError if the user does not exist', async () => {
    const result = await sut.execute({
      companyId: 'company-id',
      userAuthenticateId: 'non-existent-user-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return CompanyNotFoundError if the company does not exist', async () => {
    const user = makeUser({ companyId: new UniqueEntityID('company-id') });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      companyId: 'non-existent-company-id',
      userAuthenticateId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CompanyNotFoundError);
  });

  it('should return CompanyNotFoundError if user does not belong to the company', async () => {
    const company = makeCompany();
    const anotherCompany = makeCompany();
    await inMemoryCompaniesRepository.create(company);
    await inMemoryCompaniesRepository.create(anotherCompany);

    const user = makeUser({ companyId: company.id });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      companyId: anotherCompany.id.toString(),
      userAuthenticateId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(CompanyNotFoundError);
  });
});
