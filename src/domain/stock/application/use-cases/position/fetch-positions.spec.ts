import { makePosition } from 'test/factories/make-position';
import { makeUser } from 'test/factories/make-user';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { PositionNotFoundError } from './errors/position-not-found-error';
import { FetchPositionsUseCase } from './fetch-positions';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryPositionsRepository: InMemoryPositionsRepository;
let fetchPositionsUseCase: FetchPositionsUseCase;

describe('FetchPositionsUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryPositionsRepository = new InMemoryPositionsRepository();
    fetchPositionsUseCase = new FetchPositionsUseCase(
      inMemoryUsersRepository,
      inMemoryPositionsRepository,
    );
  });

  it('should paginate positions and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const totalPositions = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalPositions; i++) {
      await inMemoryPositionsRepository.create(
        makePosition({ companyId: user.companyId }),
      );
    }

    const result = await fetchPositionsUseCase.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { positions, meta } = result.value;

      expect(positions).toHaveLength(itemsPerPage);

      expect(meta.totalItems).toBe(totalPositions);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalPositions / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await fetchPositionsUseCase.execute({
      authenticatedId: 'non-existent-user-id',
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return PositionNotFoundError if no positions are found', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await fetchPositionsUseCase.execute({
      authenticatedId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PositionNotFoundError);
  });
});
