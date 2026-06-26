import { makeAddressing } from 'test/factories/make-addressing';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { DeleteAddressingUseCase } from './delete-addressing';
import { AddressingHasBalanceError } from './errors/addressing-has-balance-error';
import { AddressingNotFoundError } from './errors/addressing-not-found-error';

let usersRepository: InMemoryUsersRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let deleteAddressingUseCase: DeleteAddressingUseCase;

describe('DeleteAddressingUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    addressingsRepository = new InMemoryAddressingsRepository();

    deleteAddressingUseCase = new DeleteAddressingUseCase(
      usersRepository,
      addressingsRepository,
    );
  });

  it('should delete an addressing successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      amount: 0,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(addressingsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await deleteAddressingUseCase.execute({
      authenticateId: 'non-existent-user',
      addressingId: 'any-addressing',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await deleteAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: 'any-addressing',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return AddressingNotFoundError if addressing does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await deleteAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: 'non-existent-addressing',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingNotFoundError);
  });

  it('should return AddressingHasBalanceError if addressing has balance', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      amount: 10,
    });
    await addressingsRepository.create(addressing);

    const result = await deleteAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingHasBalanceError);
  });
});
