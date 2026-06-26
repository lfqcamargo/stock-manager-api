import { makeAddressing } from 'test/factories/make-addressing';
import { makePosition } from 'test/factories/make-position';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { AddressingHasBalanceError } from '../addressing/errors/addressing-has-balance-error';
import { DeletePositionUseCase } from './delete-position';
import { PositionNotFoundError } from './errors/position-not-found-error';

let usersRepository: InMemoryUsersRepository;
let positionsRepository: InMemoryPositionsRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let deletePositionUseCase: DeletePositionUseCase;

describe('DeletePositionUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    positionsRepository = new InMemoryPositionsRepository();
    addressingsRepository = new InMemoryAddressingsRepository();

    deletePositionUseCase = new DeletePositionUseCase(
      usersRepository,
      positionsRepository,
      addressingsRepository,
    );
  });

  it('should delete a position and its associated addressings successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const position = makePosition({ companyId: user.companyId });
    await positionsRepository.create(position);

    const addressing = makeAddressing({
      companyId: user.companyId,
      positionId: position.id,
      amount: 0,
    });
    await addressingsRepository.create(addressing);

    const result = await deletePositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(positionsRepository.items).toHaveLength(0);
    expect(addressingsRepository.items).toHaveLength(0);
  });

  it('should delete a position successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const position = makePosition({ companyId: user.companyId });
    await positionsRepository.create(position);

    const result = await deletePositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(positionsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await deletePositionUseCase.execute({
      authenticateId: 'non-existent-user',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await deletePositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return PositionNotFoundError if position does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await deletePositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: 'non-existent-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PositionNotFoundError);
  });

  it('should return AddressingHasBalanceError if position has addressings with balance', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const position = makePosition({ companyId: user.companyId });
    await positionsRepository.create(position);

    const addressing = makeAddressing({
      companyId: user.companyId,
      positionId: position.id,
      amount: 10,
    });
    await addressingsRepository.create(addressing);

    const result = await deletePositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingHasBalanceError);
  });
});
