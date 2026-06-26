import { makeLocation } from 'test/factories/make-location';
import { makeSubLocation } from 'test/factories/make-sub-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemorySubLocationsRepository } from 'test/repositories/in-memory-sub-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';
import { FindSubLocationByIdUseCase } from './find-sub-location-by-id';

describe('FindSubLocationByIdUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let subLocationsRepository: InMemorySubLocationsRepository;
  let findSubLocationByIdUseCase: FindSubLocationByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    const locationsRepository = new InMemoryLocationsRepository();
    subLocationsRepository = new InMemorySubLocationsRepository(
      locationsRepository,
    );
    findSubLocationByIdUseCase = new FindSubLocationByIdUseCase(
      usersRepository,
      subLocationsRepository,
    );
  });

  it('should be able to find a sub-location', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });
    const subLocation = makeSubLocation({
      companyId: user.companyId,
      locationId: location.id,
    });
    await subLocationsRepository.create(subLocation);

    const result = await findSubLocationByIdUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: subLocation.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ subLocation });
  });

  it('should return error if user does not exist', async () => {
    const result = await findSubLocationByIdUseCase.execute({
      authenticateId: 'non-existent',
      subLocationId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if sub-location does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findSubLocationByIdUseCase.execute({
      authenticateId: user.id.toString(),
      subLocationId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SubLocationNotFoundError);
  });
});
