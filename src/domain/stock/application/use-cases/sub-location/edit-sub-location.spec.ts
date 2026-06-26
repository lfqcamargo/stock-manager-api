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

import { EditSubLocationUseCase } from './edit-sub-location';
import { AlreadyExistsSubLocationError } from './errors/already-exists-sub-location-error';
import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';

let usersRepository: InMemoryUsersRepository;
let subLocationsRepository: InMemorySubLocationsRepository;
let editSubLocationUseCase: EditSubLocationUseCase;

describe('EditSubLocationUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    const locationsRepository = new InMemoryLocationsRepository();
    subLocationsRepository = new InMemorySubLocationsRepository(
      locationsRepository,
    );

    editSubLocationUseCase = new EditSubLocationUseCase(
      usersRepository,
      subLocationsRepository,
    );
  });

  it('should edit a sub-location successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });
    const subLocation = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
      code: 'OLD-001',
      name: 'Old Name',
      description: 'Old Description',
    });
    await subLocationsRepository.create(subLocation);

    const result = await editSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation.id.toString(),
      code: 'NEW-001',
      name: 'New Name',
      description: 'New Description',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.subLocation.name).toBe('New Name');
      expect(result.value.subLocation.code).toBe('NEW-001');
      expect(result.value.subLocation.description).toBe('New Description');
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await editSubLocationUseCase.execute({
      authenticateId: 'non-existent-user',
      subLocationId: 'any-sub-location',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await editSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: 'any-sub-location',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return SubLocationNotFoundError if sub-location does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await editSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: 'non-existent-sub-location',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SubLocationNotFoundError);
  });

  it('should return AlreadyExistsSubLocationError if name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });

    const subLocation1 = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
      code: 'SUB-001',
      name: 'Sub 1',
    });
    const subLocation2 = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
      code: 'SUB-002',
      name: 'Sub 2',
    });

    await subLocationsRepository.create(subLocation1);
    await subLocationsRepository.create(subLocation2);

    const result = await editSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation1.id.toString(),
      code: 'SUB-001',
      name: 'Sub 2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsSubLocationError);
  });

  it('should return AlreadyExistsSubLocationError if code already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });

    const subLocation1 = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
      code: 'SUB-001',
      name: 'Sub 1',
    });
    const subLocation2 = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
      code: 'SUB-002',
      name: 'Sub 2',
    });

    await subLocationsRepository.create(subLocation1);
    await subLocationsRepository.create(subLocation2);

    const result = await editSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation1.id.toString(),
      code: 'SUB-002',
      name: 'Sub 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsSubLocationError);
  });
});
