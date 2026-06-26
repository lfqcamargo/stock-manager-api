import { makeLocation } from 'test/factories/make-location';
import { makeSubLocation } from 'test/factories/make-sub-location';
import { makeUser } from 'test/factories/make-user';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemorySubLocationsRepository } from 'test/repositories/in-memory-sub-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { SubLocationNotFoundError } from './errors/sub-location-not-found-error';
import { FetchSubLocationsUseCase } from './fetch-sub-locations';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemorySubLocationsRepository: InMemorySubLocationsRepository;
let fetchSubLocationsUseCase: FetchSubLocationsUseCase;

describe('FetchSubLocationsUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    const locationsRepository = new InMemoryLocationsRepository();
    inMemorySubLocationsRepository = new InMemorySubLocationsRepository(
      locationsRepository,
    );
    fetchSubLocationsUseCase = new FetchSubLocationsUseCase(
      inMemoryUsersRepository,
      inMemorySubLocationsRepository,
    );
  });

  it('should paginate sub-locations and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const location = makeLocation({ companyId: user.companyId });

    const totalSubLocations = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalSubLocations; i++) {
      await inMemorySubLocationsRepository.create(
        makeSubLocation({
          companyId: user.companyId,
          locationId: location.id,
        }),
      );
    }

    const result = await fetchSubLocationsUseCase.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { subLocations, meta } = result.value;

      expect(subLocations).toHaveLength(itemsPerPage);

      expect(meta.totalItems).toBe(totalSubLocations);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalSubLocations / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await fetchSubLocationsUseCase.execute({
      authenticatedId: 'non-existent-user-id',
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return SubLocationNotFoundError if no sub-locations are found', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await fetchSubLocationsUseCase.execute({
      authenticatedId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SubLocationNotFoundError);
  });
});
