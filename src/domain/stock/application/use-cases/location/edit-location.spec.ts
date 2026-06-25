import { makeLocation } from 'test/factories/make-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditLocationUseCase } from './edit-location';
import { AlreadyExistsLocationError } from './errors/already-exists-location-error';
import { LocationNotFoundError } from './errors/location-not-found-error';

let usersRepository: InMemoryUsersRepository;
let locationsRepository: InMemoryLocationsRepository;
let sut: EditLocationUseCase;

describe('EditLocationUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    locationsRepository = new InMemoryLocationsRepository();

    sut = new EditLocationUseCase(usersRepository, locationsRepository);
  });

  it('should edit a location successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({
      companyId: user.companyId,
      code: 'OLD-001',
    });
    await locationsRepository.create(location);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      locationId: location.id.toString(),
      code: 'NEW-001',
      name: 'New Location Name',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.location.name).toBe('New Location Name');
      expect(result.value.location.code).toBe('NEW-001');
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-user',
      locationId: 'any-location',
      code: 'LOC-001',
      name: 'Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      locationId: 'any-location',
      code: 'LOC-001',
      name: 'Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return LocationNotFoundError if location does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      locationId: 'non-existent-location',
      code: 'LOC-001',
      name: 'Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(LocationNotFoundError);
  });

  it('should return AlreadyExistsLocationError if name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location1 = makeLocation({
      companyId: user.companyId,
      code: 'LOC-A',
      name: 'Loc A',
    });
    const location2 = makeLocation({
      companyId: user.companyId,
      code: 'LOC-B',
      name: 'Loc B',
    });

    await locationsRepository.create(location1);
    await locationsRepository.create(location2);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      locationId: location1.id.toString(),
      code: 'LOC-A',
      name: 'Loc B',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsLocationError);
  });
});
