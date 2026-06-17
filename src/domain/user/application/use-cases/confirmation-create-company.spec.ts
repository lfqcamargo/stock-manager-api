import { makeCompany } from 'test/factories/make-company';
import { makeTempCompany } from 'test/factories/make-temp-company';
import { makeUser } from 'test/factories/make-user';
import { InMemoryCompaniesRepository } from 'test/repositories/in-memory-companies-repository';
import { InMemoryTempCompaniesRepository } from 'test/repositories/in-memory-temp-companies-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';

import { ConfirmationCreateCompanyUserUseCase } from './confirmation-create-company';
import { AlreadyExistsCnpjError } from './errors/already-exists-cnpj-error';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';
import { ResourceTokenNotFoundError } from './errors/resource-token-not-found-error';
import { TokenExpiratedError } from './errors/token-expirated-error';

let inMemoryTempCompaniesRepository: InMemoryTempCompaniesRepository;
let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: ConfirmationCreateCompanyUserUseCase;

describe('Confirmation Create Company Use Case', () => {
  beforeEach(() => {
    inMemoryTempCompaniesRepository = new InMemoryTempCompaniesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new ConfirmationCreateCompanyUserUseCase(
      inMemoryTempCompaniesRepository,
      inMemoryCompaniesRepository,
      inMemoryUsersRepository,
    );
  });

  it('should be able to confirm company and user creation', async () => {
    const tempCompany = makeTempCompany({});
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const result = await sut.execute({ token: tempCompany.token });

    expect(result.isRight()).toBe(true);
    const company = inMemoryCompaniesRepository.items[0];
    expect(company.cnpj).toEqual(tempCompany.companyCnpj);
    expect(company.name).toEqual(tempCompany.companyName);
    expect(company.users).toHaveLength(1);
    expect(company.users[0].email).toEqual(tempCompany.userEmail);
    expect(company.users[0].name).toEqual(tempCompany.userName);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(inMemoryTempCompaniesRepository.items).toHaveLength(0);
  });

  it('should not be able to confirm with an invalid token', async () => {
    const result = await sut.execute({ token: 'invalid-token' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceTokenNotFoundError);
  });

  it('should not be able to confirm with an expired token', async () => {
    const tempCompany = makeTempCompany({
      expirationDate: new Date(Date.now() - 1000),
    });
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const result = await sut.execute({ token: tempCompany.token });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(TokenExpiratedError);
  });

  it('should not be able to confirm when cnpj already exists', async () => {
    const cnpj = '12345678000199';

    await inMemoryCompaniesRepository.create(makeCompany({ cnpj }));

    const tempCompany = makeTempCompany({ companyCnpj: cnpj });
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const result = await sut.execute({ token: tempCompany.token });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsCnpjError);
  });

  it('should not be able to confirm when email already exists', async () => {
    const email = 'existing@email.com';

    await inMemoryUsersRepository.create(makeUser({ email }));

    const tempCompany = makeTempCompany({ userEmail: email });
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const result = await sut.execute({ token: tempCompany.token });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsEmailError);
  });
});
