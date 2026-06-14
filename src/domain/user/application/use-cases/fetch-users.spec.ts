import { makeCompany } from 'test/factories/make-company';
import { makeUser } from 'test/factories/make-user';
import { InMemoryCompaniesRepository } from 'test/repositories/in-memory-companies-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserRole } from '../../enterprise/entities/user';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';
import { FetchUsersCompanyIdUseCase } from './fetch-users';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let sut: FetchUsersCompanyIdUseCase;

describe('FetchUsersCompanyIdUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository();

    sut = new FetchUsersCompanyIdUseCase(inMemoryUsersRepository);
  });

  it('should return all users and metadata for a valid company and authenticated admin user', async () => {
    const company = makeCompany();

    const adminUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    const otherUser = makeUser({
      companyId: company.id,
    });

    await inMemoryCompaniesRepository.create(company);
    await inMemoryUsersRepository.create(adminUser);
    await inMemoryUsersRepository.create(otherUser);

    const otherCompany = makeCompany();

    const otherCompanyUser = makeUser({
      companyId: otherCompany.id,
    });

    await inMemoryCompaniesRepository.create(otherCompany);
    await inMemoryUsersRepository.create(otherCompanyUser);

    const result = await sut.execute({
      authenticatedUserId: adminUser.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { users, meta } = result.value;

      expect(users).toHaveLength(2);

      users.forEach((user) => {
        expect(user.companyId).toEqual(company.id);
      });

      expect(meta).toBeDefined();

      expect(typeof meta.totalItems).toBe('number');
      expect(typeof meta.itemCount).toBe('number');
      expect(typeof meta.itemsPerPage).toBe('number');
      expect(typeof meta.totalPages).toBe('number');
      expect(typeof meta.currentPage).toBe('number');
      expect(typeof meta.totalAdmin).toBe('number');
      expect(typeof meta.totalMaanger).toBe('number');
      expect(typeof meta.totalEmployee).toBe('number');
      expect(typeof meta.totalActive).toBe('number');
      expect(typeof meta.totalInactive).toBe('number');

      expect(meta.lastCreated).toBeInstanceOf(Date);

      expect(meta.itemCount).toBe(users.length);
      expect(meta.currentPage).toBe(1);
      expect(meta.itemsPerPage).toBe(20);
    }
  });

  it('should return UserNotFoundError if authenticated user does not exist', async () => {
    const result = await sut.execute({
      authenticatedUserId: 'non-existent-user',
    });

    expect(result.isLeft()).toBe(true);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(UserNotFoundError);
    }
  });

  it('should return UserNotAdminError if authenticated user is not admin', async () => {
    const company = makeCompany();

    const employee = makeUser({
      companyId: company.id,
      role: UserRole.EMPLOYEE,
    });

    await inMemoryCompaniesRepository.create(company);
    await inMemoryUsersRepository.create(employee);

    const result = await sut.execute({
      authenticatedUserId: employee.id.toString(),
    });

    expect(result.isLeft()).toBe(true);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(UserNotAdminError);
    }
  });

  it('should filter users by role', async () => {
    const company = makeCompany();

    const authenticatedUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    const adminUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    const managerUser = makeUser({
      companyId: company.id,
      role: UserRole.MANAGER,
    });

    const employeeUser = makeUser({
      companyId: company.id,
      role: UserRole.EMPLOYEE,
    });

    await inMemoryCompaniesRepository.create(company);

    await inMemoryUsersRepository.create(authenticatedUser);
    await inMemoryUsersRepository.create(adminUser);
    await inMemoryUsersRepository.create(managerUser);
    await inMemoryUsersRepository.create(employeeUser);

    const result = await sut.execute({
      authenticatedUserId: authenticatedUser.id.toString(),
      role: UserRole.ADMIN,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { users } = result.value;

      expect(users).toHaveLength(2);

      users.forEach((user) => {
        expect(user.role).toBe(UserRole.ADMIN);
      });
    }
  });

  it('should filter users by active status', async () => {
    const company = makeCompany();

    const authenticatedUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
      active: true,
    });

    const activeUser = makeUser({
      companyId: company.id,
      active: true,
    });

    const inactiveUser = makeUser({
      companyId: company.id,
      active: false,
    });

    await inMemoryCompaniesRepository.create(company);

    await inMemoryUsersRepository.create(authenticatedUser);
    await inMemoryUsersRepository.create(activeUser);
    await inMemoryUsersRepository.create(inactiveUser);

    const result = await sut.execute({
      authenticatedUserId: authenticatedUser.id.toString(),
      active: true,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { users } = result.value;

      expect(users).toHaveLength(2);

      users.forEach((user) => {
        expect(user.isActive).toBe(true);
      });
    }
  });

  it('should filter users by name', async () => {
    const company = makeCompany();

    const authenticatedUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
      name: 'John Doe',
    });

    const johnUser = makeUser({
      companyId: company.id,
      name: 'Johnny Appleseed',
    });

    const janeUser = makeUser({
      companyId: company.id,
      name: 'Jane Smith',
    });

    await inMemoryCompaniesRepository.create(company);

    await inMemoryUsersRepository.create(authenticatedUser);
    await inMemoryUsersRepository.create(johnUser);
    await inMemoryUsersRepository.create(janeUser);

    const result = await sut.execute({
      authenticatedUserId: authenticatedUser.id.toString(),
      name: 'John',
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { users } = result.value;

      expect(users).toHaveLength(2);

      users.forEach((user) => {
        expect(user.name.toLowerCase()).toContain('john');
      });
    }
  });

  it('should filter users by email', async () => {
    const company = makeCompany();

    const authenticatedUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
      email: 'john@example.com',
    });

    const exampleUser = makeUser({
      companyId: company.id,
      email: 'jane@example.com',
    });

    const otherUser = makeUser({
      companyId: company.id,
      email: 'user@other.com',
    });

    await inMemoryCompaniesRepository.create(company);

    await inMemoryUsersRepository.create(authenticatedUser);
    await inMemoryUsersRepository.create(exampleUser);
    await inMemoryUsersRepository.create(otherUser);

    const result = await sut.execute({
      authenticatedUserId: authenticatedUser.id.toString(),
      email: 'example',
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { users } = result.value;

      expect(users).toHaveLength(2);

      users.forEach((user) => {
        expect(user.email.toLowerCase()).toContain('example');
      });
    }
  });

  it('should filter users by multiple criteria', async () => {
    const company = makeCompany();

    const authenticatedUser = makeUser({
      companyId: company.id,
      role: UserRole.ADMIN,
      name: 'John Doe',
      active: true,
    });

    const matchingUser = makeUser({
      companyId: company.id,
      name: 'John Smith',
      role: UserRole.ADMIN,
      active: true,
    });

    const nonMatchingUser1 = makeUser({
      companyId: company.id,
      name: 'John Brown',
      role: UserRole.EMPLOYEE,
      active: true,
    });

    const nonMatchingUser2 = makeUser({
      companyId: company.id,
      name: 'Jane Doe',
      role: UserRole.ADMIN,
      active: true,
    });

    await inMemoryCompaniesRepository.create(company);

    await inMemoryUsersRepository.create(authenticatedUser);
    await inMemoryUsersRepository.create(matchingUser);
    await inMemoryUsersRepository.create(nonMatchingUser1);
    await inMemoryUsersRepository.create(nonMatchingUser2);

    const result = await sut.execute({
      authenticatedUserId: authenticatedUser.id.toString(),
      name: 'John',
      role: UserRole.ADMIN,
      active: true,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      const { users } = result.value;

      expect(users).toHaveLength(2);

      users.forEach((user) => {
        expect(user.name.toLowerCase()).toContain('john');
        expect(user.role).toBe(UserRole.ADMIN);
        expect(user.isActive).toBe(true);
      });
    }
  });
});
