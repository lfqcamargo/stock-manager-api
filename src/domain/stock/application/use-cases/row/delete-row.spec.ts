import { makeAddressing } from 'test/factories/make-addressing';
import { makeRow } from 'test/factories/make-row';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryUnitOfWork } from 'test/repositories/in-memory-unit-of-work';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { DeleteRowUseCase } from './delete-row';
import { RowNotFoundError } from './errors/row-not-found-error';

let usersRepository: InMemoryUsersRepository;
let rowsRepository: InMemoryRowsRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let unitOfWork: InMemoryUnitOfWork;
let deleteRowUseCase: DeleteRowUseCase;

describe('DeleteRowUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rowsRepository = new InMemoryRowsRepository();
    addressingsRepository = new InMemoryAddressingsRepository();
    unitOfWork = new InMemoryUnitOfWork();

    deleteRowUseCase = new DeleteRowUseCase(
      unitOfWork,
      usersRepository,
      rowsRepository,
      addressingsRepository,
    );
  });

  it('should delete a row and its associated addressings successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const row = makeRow({ companyId: user.companyId });
    await rowsRepository.create(row);

    const addressing = makeAddressing({
      companyId: user.companyId,
      rowId: row.id,
      amount: 0,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(rowsRepository.items).toHaveLength(0);
    expect(addressingsRepository.items).toHaveLength(0);
  });

  it('should delete a row successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const row = makeRow({ companyId: user.companyId });
    await rowsRepository.create(row);

    const result = await deleteRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(rowsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await deleteRowUseCase.execute({
      authenticateId: 'non-existent-user',
      rowId: 'any-row',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await deleteRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: 'any-row',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return RowNotFoundError if row does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await deleteRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: 'non-existent-row',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RowNotFoundError);
  });

  it('should return AddressingHasBalanceError if row has addressings with balance', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const row = makeRow({ companyId: user.companyId });
    await rowsRepository.create(row);

    const addressing = makeAddressing({
      companyId: user.companyId,
      rowId: row.id,
      amount: 10,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteRowUseCase.execute({
      authenticateId: user.id.toString(),
      rowId: row.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingHasBalanceError);
  });
});
