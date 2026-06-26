import { makeShelf } from 'test/factories/make-shelf';
import { makeUser } from 'test/factories/make-user';
import { InMemoryShelfsRepository } from 'test/repositories/in-memory-shelfs-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { ShelfNotFoundError } from './errors/shelf-not-found-error';
import { FindShelfByIdUseCase } from './find-shelf-by-id';

describe('FindShelfByIdUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let shelfsRepository: InMemoryShelfsRepository;
  let findShelfByIdUseCase: FindShelfByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    shelfsRepository = new InMemoryShelfsRepository();
    findShelfByIdUseCase = new FindShelfByIdUseCase(
      usersRepository,
      shelfsRepository,
    );
  });

  it('should be able to find a shelf', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const shelf = makeShelf({ companyId: user.companyId });
    await shelfsRepository.create(shelf);

    const result = await findShelfByIdUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ shelf });
  });

  it('should return error if user does not exist', async () => {
    const result = await findShelfByIdUseCase.execute({
      authenticateId: 'non-existent',
      shelfId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if shelf does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findShelfByIdUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ShelfNotFoundError);
  });
});
