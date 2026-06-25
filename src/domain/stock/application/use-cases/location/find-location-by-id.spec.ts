import { makeLocation } from 'test/factories/make-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { LocationNotFoundError } from './errors/location-not-found-error';
import { FindLocationByIdUseCase } from './find-location-by-id';

describe('FindLocationUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let locationsRepository: InMemoryLocationsRepository;
  let findLocation: FindLocationByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    locationsRepository = new InMemoryLocationsRepository();
    findLocation = new FindLocationByIdUseCase(
      usersRepository,
      locationsRepository,
    );
  });

  it('should be able to find a location', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });
    await locationsRepository.create(location);

    const result = await findLocation.execute({
      authenticateId: user.id.toString(),
      locationId: location.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ location });
  });

  it('should return error if user does not exist', async () => {
    const result = await findLocation.execute({
      authenticateId: 'non-existent',
      locationId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if location does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findLocation.execute({
      authenticateId: user.id.toString(),
      locationId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(LocationNotFoundError);
  });
});
