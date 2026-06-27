import { makeMovement } from 'test/factories/make-movement';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementsRepository } from 'test/repositories/in-memory-movements-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { FetchMovementsUseCase } from './fetch-movements';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementsRepository: InMemoryMovementsRepository;
let sut: FetchMovementsUseCase;

describe('FetchMovementsUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementsRepository = new InMemoryMovementsRepository();
    sut = new FetchMovementsUseCase(
      inMemoryUsersRepository,
      inMemoryMovementsRepository,
    );
  });

  it('should paginate movements and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const totalItems = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalItems; i++) {
      await inMemoryMovementsRepository.create(
        makeMovement({ companyId: user.companyId }),
      );
    }

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { movements, meta } = result.value;

      expect(movements).toHaveLength(itemsPerPage);
      expect(meta.totalItems).toBe(totalItems);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalItems / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
    }
  });

  it('should return an empty list when no movements exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticatedId: user.id.toString(),
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movements).toHaveLength(0);
      expect(result.value.meta.totalItems).toBe(0);
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticatedId: 'non-existent-id',
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
