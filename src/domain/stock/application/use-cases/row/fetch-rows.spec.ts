import { makeRow } from 'test/factories/make-row';
import { makeUser } from 'test/factories/make-user';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { RowNotFoundError } from './errors/row-not-found-error';
import { FetchRowsUseCase } from './fetch-rows';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryRowsRepository: InMemoryRowsRepository;
let fetchRowsUseCase: FetchRowsUseCase;

describe('FetchRowsUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryRowsRepository = new InMemoryRowsRepository();
    fetchRowsUseCase = new FetchRowsUseCase(
      inMemoryUsersRepository,
      inMemoryRowsRepository,
    );
  });

  it('should paginate rows and return correct meta data', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const totalRows = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalRows; i++) {
      await inMemoryRowsRepository.create(
        makeRow({ companyId: user.companyId }),
      );
    }

    const result = await fetchRowsUseCase.execute({
      authenticatedId: user.id.toString(),
      page,
      itemsPerPage,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const { rows, meta } = result.value;

      expect(rows).toHaveLength(itemsPerPage);

      expect(meta.totalItems).toBe(totalRows);
      expect(meta.itemsPerPage).toBe(itemsPerPage);
      expect(meta.currentPage).toBe(page);
      expect(meta.totalPages).toBe(Math.ceil(totalRows / itemsPerPage));
      expect(meta.itemCount).toBe(itemsPerPage);
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await fetchRowsUseCase.execute({
      authenticatedId: 'non-existent-user-id',
      page: 1,
      itemsPerPage: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return RowNotFoundError if no rows are found', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await fetchRowsUseCase.execute({
      authenticatedId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RowNotFoundError);
  });
});
