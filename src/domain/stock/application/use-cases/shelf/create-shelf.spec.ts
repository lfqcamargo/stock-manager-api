import { makeShelf } from 'test/factories/make-shelf';
import { makeUser } from 'test/factories/make-user';
import { InMemoryShelfsRepository } from 'test/repositories/in-memory-shelfs-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { CreateShelfUseCase } from './create-shelf';
import { AlreadyExistsShelfError } from './errors/already-exists-shelf-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryShelfsRepository: InMemoryShelfsRepository;
let createShelfUseCase: CreateShelfUseCase;

describe('CreateShelfUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryShelfsRepository = new InMemoryShelfsRepository();

    createShelfUseCase = new CreateShelfUseCase(
      inMemoryUsersRepository,
      inMemoryShelfsRepository,
    );
  });

  it('should be able to create a shelf', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const result = await createShelfUseCase.execute({
      authenticateId: adminUser.id.toString(),
      code: 'SHELF-001',
      name: 'Shelf 1',
      description: 'Test Shelf',
    });

    expect(result.isRight()).toBe(true);
    const shelf = inMemoryShelfsRepository.items[0];

    expect(shelf).toBeDefined();
    expect(shelf.code).toBe('SHELF-001');
    expect(shelf.name).toBe('Shelf 1');
    expect(shelf.description).toBe('Test Shelf');
    expect(shelf.companyId.toString()).toBe(adminUser.companyId.toString());
  });

  it('should not create shelf if user is not found', async () => {
    const result = await createShelfUseCase.execute({
      authenticateId: 'non-existent-id',
      code: 'SHELF-001',
      name: 'Shelf 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create shelf if user is not admin or manager', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createShelfUseCase.execute({
      authenticateId: employee.id.toString(),
      code: 'SHELF-001',
      name: 'Shelf 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create shelf if name already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const shelf = makeShelf({
      companyId: admin.companyId,
      name: 'Shelf 1',
    });
    await inMemoryShelfsRepository.create(shelf);

    const result = await createShelfUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'SHELF-002',
      name: 'Shelf 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsShelfError);
  });

  it('should not create shelf if code already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const shelf = makeShelf({
      companyId: admin.companyId,
      code: 'SHELF-001',
    });
    await inMemoryShelfsRepository.create(shelf);

    const result = await createShelfUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'SHELF-001',
      name: 'Another Shelf',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsShelfError);
  });
});
