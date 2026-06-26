import { makeAddressing } from 'test/factories/make-addressing';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { AddressingNotFoundError } from './errors/addressing-not-found-error';
import { FindAddressingByIdUseCase } from './find-addressing-by-id';

describe('FindAddressingByIdUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let addressingsRepository: InMemoryAddressingsRepository;
  let findAddressingByIdUseCase: FindAddressingByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    addressingsRepository = new InMemoryAddressingsRepository();
    findAddressingByIdUseCase = new FindAddressingByIdUseCase(
      usersRepository,
      addressingsRepository,
    );
  });

  it('should be able to find an addressing', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const addressing = makeAddressing({ companyId: user.companyId });
    await addressingsRepository.create(addressing);

    const result = await findAddressingByIdUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ addressing });
  });

  it('should return error if user does not exist', async () => {
    const result = await findAddressingByIdUseCase.execute({
      authenticateId: 'non-existent',
      addressingId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if addressing does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findAddressingByIdUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingNotFoundError);
  });
});
