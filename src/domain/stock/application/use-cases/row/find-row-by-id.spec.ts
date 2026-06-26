import { makeRow } from 'test/factories/make-row';
import { makeUser } from 'test/factories/make-user';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { RowNotFoundError } from './errors/row-not-found-error';
import { FindRowByIdUseCase } from './find-row-by-id';

describe('FindRowByIdUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let rowsRepository: InMemoryRowsRepository;
  let findRowByIdUseCase: FindRowByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rowsRepository = new InMemoryRowsRepository();
    findRowByIdUseCase = new FindRowByIdUseCase(
      usersRepository,
      rowsRepository,
    );
  });

  it('should be able to find a row', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const row = makeRow({ companyId: user.companyId });
    await rowsRepository.create(row);

    const result = await findRowByIdUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ row });
  });

  it('should return error if user does not exist', async () => {
    const result = await findRowByIdUseCase.execute({
      authenticateId: 'non-existent',
      rowId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if row does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findRowByIdUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RowNotFoundError);
  });
});
