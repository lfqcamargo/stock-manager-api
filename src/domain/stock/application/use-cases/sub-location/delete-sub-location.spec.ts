import { makeAddressing } from 'test/factories/make-addressing';
import { makeLocation } from 'test/factories/make-location';
import { makeSubLocation } from 'test/factories/make-sub-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemorySubLocationsRepository } from 'test/repositories/in-memory-sub-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { DeleteSubLocationUseCase } from './delete-sub-location';
import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';

let usersRepository: InMemoryUsersRepository;
let subLocationsRepository: InMemorySubLocationsRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let deleteSubLocationUseCase: DeleteSubLocationUseCase;

describe('DeleteSubLocationUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    const locationsRepository = new InMemoryLocationsRepository();
    subLocationsRepository = new InMemorySubLocationsRepository(
      locationsRepository,
    );
    addressingsRepository = new InMemoryAddressingsRepository();

    deleteSubLocationUseCase = new DeleteSubLocationUseCase(
      usersRepository,
      subLocationsRepository,
      addressingsRepository,
    );
  });

  it('should delete a sub-location and its associated addressings successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });
    const subLocation = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
    });
    await subLocationsRepository.create(subLocation);

    const addressing = makeAddressing({
      companyId: user.companyId,
      subLocationId: subLocation.id,
      amount: 0,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(subLocationsRepository.items).toHaveLength(0);
    expect(addressingsRepository.items).toHaveLength(0);
  });

  it('should delete a sub-location successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });
    const subLocation = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
    });
    await subLocationsRepository.create(subLocation);

    const result = await deleteSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(subLocationsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await deleteSubLocationUseCase.execute({
      authenticateId: 'non-existent-user',
      subLocationId: 'any-sub-location',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await deleteSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: 'any-sub-location',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return SubLocationNotFoundError if sub-location does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await deleteSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: 'non-existent-sub-location',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SubLocationNotFoundError);
  });

  it('should return AddressingHasBalanceError if sub-location has addressings with balance', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });
    const subLocation = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
    });
    await subLocationsRepository.create(subLocation);

    const addressing = makeAddressing({
      companyId: user.companyId,
      subLocationId: subLocation.id,
      amount: 10,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteSubLocationUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingHasBalanceError);
  });
});
