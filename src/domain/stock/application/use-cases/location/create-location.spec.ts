import { UserNotAllowedError } from 'src/domain/user/application/use-cases/errors/user-not-allowed-error';
import { makeLocation } from 'test/factories/make-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { CreateLocationUseCase } from './create-location';
import { AlreadyExistsLocationError } from './errors/already-exists-location-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryLocationsRepository: InMemoryLocationsRepository;
let createLocationUseCase: CreateLocationUseCase;

describe('Create location use case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryLocationsRepository = new InMemoryLocationsRepository();

    createLocationUseCase = new CreateLocationUseCase(
      inMemoryUsersRepository,
      inMemoryLocationsRepository,
    );
  });

  it('should be able to create a location', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const result = await createLocationUseCase.execute({
      authenticateId: adminUser.id.toString(),
      code: 'LOC-001',
      name: 'Main Warehouse',
      description: 'Main storage location',
    });

    expect(result.isRight()).toBe(true);
    const location = inMemoryLocationsRepository.items[0];

    expect(location).toBeDefined();
    expect(location.code).toBe('LOC-001');
    expect(location.name).toBe('Main Warehouse');
    expect(location.description).toBe('Main storage location');
    expect(location.companyId.toString()).toBe(adminUser.companyId.toString());
  });

  it('should not create location if user is not found', async () => {
    const result = await createLocationUseCase.execute({
      authenticateId: 'non-existent-id',
      code: 'LOC-001',
      name: 'Main Warehouse',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create location if user is not admin or manager', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createLocationUseCase.execute({
      authenticateId: employee.id.toString(),
      code: 'LOC-001',
      name: 'Main Warehouse',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create location if name already exists in the company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({
      companyId: admin.companyId,
      name: 'Main Warehouse',
    });
    await inMemoryLocationsRepository.create(location);

    const result = await createLocationUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'LOC-001',
      name: 'Main Warehouse',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsLocationError);
  });

  it('should not create location if code already exists in the company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({
      companyId: admin.companyId,
      code: 'LOC-001',
    });
    await inMemoryLocationsRepository.create(location);

    const result = await createLocationUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'LOC-001',
      name: 'Main Warehouse',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsLocationError);
  });
});
