import { makeLocation } from 'test/factories/make-location';
import { makeSubLocation } from 'test/factories/make-sub-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemorySubLocationsRepository } from 'test/repositories/in-memory-sub-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { LocationNotFoundError } from '../location/errors/location-not-found-error';
import { CreateSubLocationUseCase } from './create-sub-location';
import { AlreadyExistsSubLocationError } from './errors/already-exists-sub-location-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryLocationsRepository: InMemoryLocationsRepository;
let inMemorySubLocationsRepository: InMemorySubLocationsRepository;
let createSubLocationUseCase: CreateSubLocationUseCase;

describe('CreateSubLocationUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryLocationsRepository = new InMemoryLocationsRepository();
    inMemorySubLocationsRepository = new InMemorySubLocationsRepository(
      inMemoryLocationsRepository,
    );

    createSubLocationUseCase = new CreateSubLocationUseCase(
      inMemoryUsersRepository,
      inMemoryLocationsRepository,
      inMemorySubLocationsRepository,
    );
  });

  it('should be able to create a sub-location', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const location = makeLocation({ companyId: adminUser.companyId });
    await inMemoryLocationsRepository.create(location);

    const result = await createSubLocationUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      code: 'SUB-001',
      name: 'Sub Location 1',
      description: 'Test Sub Location',
    });

    expect(result.isRight()).toBe(true);
    const subLocation = inMemorySubLocationsRepository.items[0];

    expect(subLocation).toBeDefined();
    expect(subLocation.code).toBe('SUB-001');
    expect(subLocation.name).toBe('Sub Location 1');
    expect(subLocation.description).toBe('Test Sub Location');
    expect(subLocation.companyId.toString()).toBe(
      adminUser.companyId.toString(),
    );
    expect(subLocation.locationId.toString()).toBe(location.id.toString());
  });

  it('should not create sub-location if user is not found', async () => {
    const result = await createSubLocationUseCase.execute({
      authenticateId: 'non-existent-id',
      locationId: 'any-location',
      code: 'SUB-001',
      name: 'Sub Location 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create sub-location if user is not admin or manager', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createSubLocationUseCase.execute({
      authenticateId: employee.id.toString(),
      locationId: 'any-location',
      code: 'SUB-001',
      name: 'Sub Location 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create sub-location if location is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const result = await createSubLocationUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: 'non-existent-location',
      code: 'SUB-001',
      name: 'Sub Location 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(LocationNotFoundError);
  });

  it('should not create sub-location if name already exists for the same location', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: admin.companyId,
      locationId: location.id,
      name: 'Sub Location 1',
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const result = await createSubLocationUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      code: 'SUB-002',
      name: 'Sub Location 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsSubLocationError);
  });

  it('should not create sub-location if code already exists in company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: admin.companyId,
      locationId: location.id,
      code: 'SUB-001',
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const result = await createSubLocationUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      code: 'SUB-001',
      name: 'Another Sub Location',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsSubLocationError);
  });
});
