import { makeAddressing } from 'test/factories/make-addressing';
import { makeShelf } from 'test/factories/make-shelf';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryShelfsRepository } from 'test/repositories/in-memory-shelfs-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { DeleteShelfUseCase } from './delete-shelf';
import { ShelfNotFoundError } from './errors/shelf-not-found-error';

let usersRepository: InMemoryUsersRepository;
let shelfsRepository: InMemoryShelfsRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let deleteShelfUseCase: DeleteShelfUseCase;

describe('DeleteShelfUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    shelfsRepository = new InMemoryShelfsRepository();
    addressingsRepository = new InMemoryAddressingsRepository();

    deleteShelfUseCase = new DeleteShelfUseCase(
      usersRepository,
      shelfsRepository,
      addressingsRepository,
    );
  });

  it('should delete a shelf and its associated addressings successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const shelf = makeShelf({ companyId: user.companyId });
    await shelfsRepository.create(shelf);

    const addressing = makeAddressing({
      companyId: user.companyId,
      shelfId: shelf.id,
      amount: 0,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(shelfsRepository.items).toHaveLength(0);
    expect(addressingsRepository.items).toHaveLength(0);
  });

  it('should delete a shelf successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const shelf = makeShelf({ companyId: user.companyId });
    await shelfsRepository.create(shelf);

    const result = await deleteShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(shelfsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await deleteShelfUseCase.execute({
      authenticateId: 'non-existent-user',
      shelfId: 'any-shelf',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await deleteShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: 'any-shelf',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return ShelfNotFoundError if shelf does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await deleteShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: 'non-existent-shelf',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ShelfNotFoundError);
  });

  it('should return AddressingHasBalanceError if shelf has addressings with balance', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const shelf = makeShelf({ companyId: user.companyId });
    await shelfsRepository.create(shelf);

    const addressing = makeAddressing({
      companyId: user.companyId,
      shelfId: shelf.id,
      amount: 10,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteShelfUseCase.execute({
      authenticateId: user.id.toString(),
      shelfId: shelf.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingHasBalanceError);
  });
});
