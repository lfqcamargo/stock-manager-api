import { FakeHasher } from 'test/cryptography/fake-hasher';
import { makeCompany } from 'test/factories/make-company';
import { makeTempCompany } from 'test/factories/make-temp-company';
import { makeUser } from 'test/factories/make-user';
import { InMemoryCompaniesRepository } from 'test/repositories/in-memory-companies-repository';
import { InMemoryTempCompaniesRepository } from 'test/repositories/in-memory-temp-companies-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';

import { CreateTempCompanyUseCase } from './create-temp-company';
import { AlreadyExistsCnpjError } from './errors/already-exists-cnpj-error';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';

let inMemoryTempCompaniesRepository: InMemoryTempCompaniesRepository;
let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let hashGenerator: FakeHasher;
let createTempUser: CreateTempCompanyUseCase;

describe('Create temp company use case', () => {
  beforeEach(() => {
    inMemoryTempCompaniesRepository = new InMemoryTempCompaniesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    hashGenerator = new FakeHasher();

    createTempUser = new CreateTempCompanyUseCase(
      inMemoryTempCompaniesRepository,
      inMemoryCompaniesRepository,
      inMemoryUsersRepository,
      hashGenerator,
    );
  });

  it('should be able to create a temp company', async () => {
    const tempCompany = makeTempCompany();

    const result = await createTempUser.execute({
      companyCnpj: tempCompany.companyCnpj,
      companyName: tempCompany.companyName,
      userEmail: tempCompany.userEmail,
      userName: tempCompany.userName,
      userPassword: tempCompany.userPassword,
    });

    expect(result.isRight()).toBe(true);

    const tempCompanyCreated = inMemoryTempCompaniesRepository.items[0];
    expect(tempCompanyCreated.id).toBeDefined();
    expect(tempCompanyCreated.companyCnpj).toBe(tempCompany.companyCnpj);
    expect(tempCompanyCreated.companyName).toBe(tempCompany.companyName);
    expect(tempCompanyCreated.userEmail).toBe(tempCompany.userEmail);
    expect(tempCompanyCreated.userName).toBe(tempCompany.userName);
    expect(tempCompanyCreated.userPassword).toBe(
      `${tempCompany.userPassword}-hashed`,
    );
    expect(tempCompanyCreated.expirationDate).toBeDefined();
  });

  it('should be able to update a temp company with an existing email', async () => {
    const tempCompany = makeTempCompany();
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const result = await createTempUser.execute({
      companyCnpj: tempCompany.companyCnpj,
      companyName: tempCompany.companyName,
      userEmail: 'test@test.com.br',
      userName: 'Test User',
      userPassword: 'test',
    });

    expect(result.isRight()).toBe(true);

    const tempCompanyUpdated = inMemoryTempCompaniesRepository.items[0];
    expect(tempCompanyUpdated.id).toBeDefined();
    expect(tempCompanyUpdated.companyCnpj).toBe(tempCompany.companyCnpj);
    expect(tempCompanyUpdated.companyName).toBe(tempCompany.companyName);
    expect(tempCompanyUpdated.userEmail).toBe('test@test.com.br');
    expect(tempCompanyUpdated.userName).toBe('Test User');
    expect(tempCompanyUpdated.userPassword).toBe(`test-hashed`);
    expect(tempCompanyUpdated.expirationDate).toBeDefined();

    //Delete old the temp user
    expect(inMemoryTempCompaniesRepository.items.length).toBe(1);
  });

  it('should be able to update a temp company with an existing cnpj', async () => {
    const tempCompany = makeTempCompany();
    await inMemoryTempCompaniesRepository.create(tempCompany);

    const result = await createTempUser.execute({
      companyCnpj: '12345678000190',
      companyName: 'Test Company',
      userEmail: tempCompany.userEmail,
      userName: tempCompany.userName,
      userPassword: tempCompany.userPassword,
    });

    expect(result.isRight()).toBe(true);

    const tempCompanyUpdated = inMemoryTempCompaniesRepository.items[0];
    expect(tempCompanyUpdated.id).toBeDefined();
    expect(tempCompanyUpdated.companyCnpj).toBe('12345678000190');
    expect(tempCompanyUpdated.companyName).toBe('Test Company');
    expect(tempCompanyUpdated.userEmail).toBe(tempCompany.userEmail);
    expect(tempCompanyUpdated.userName).toBe(tempCompany.userName);
    expect(tempCompanyUpdated.userPassword).toBe(
      `${tempCompany.userPassword}-hashed`,
    );
    expect(tempCompanyUpdated.expirationDate).toBeDefined();

    //Delete old the temp user
    expect(inMemoryTempCompaniesRepository.items.length).toBe(1);
  });

  it('should not be able to create a temp company with an already existing email', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const tempCompany = makeTempCompany({ userEmail: user.email });

    const result = await createTempUser.execute({
      companyCnpj: tempCompany.companyCnpj,
      companyName: tempCompany.companyName,
      userEmail: tempCompany.userEmail,
      userName: tempCompany.userName,
      userPassword: tempCompany.userPassword,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsEmailError);
  });

  it('should not be able to create a temp company with an already existing cnpj', async () => {
    const company = makeCompany();
    await inMemoryCompaniesRepository.create(company);

    const tempCompany = makeTempCompany({ companyCnpj: company.cnpj });

    const result = await createTempUser.execute({
      companyCnpj: tempCompany.companyCnpj,
      companyName: tempCompany.companyName,
      userEmail: tempCompany.userEmail,
      userName: tempCompany.userName,
      userPassword: tempCompany.userPassword,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsCnpjError);
  });
});
