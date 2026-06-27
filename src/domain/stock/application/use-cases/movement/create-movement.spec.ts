import { makeAddressing } from 'test/factories/make-addressing';
import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryMovementsRepository } from 'test/repositories/in-memory-movements-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';

import { AddressingNotFoundError } from '../addressing/errors/addressing-not-found-error';
import { MovementTypeNotFoundError } from '../movement-type/errors/movement-type-not-found-error';
import { CreateMovementUseCase } from './create-movement';
import { InsufficientBalanceError } from './errors/insufficient-balance-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementsRepository: InMemoryMovementsRepository;
let inMemoryAddressingsRepository: InMemoryAddressingsRepository;
let inMemoryMovementTypesRepository: InMemoryMovementTypesRepository;
let sut: CreateMovementUseCase;

describe('CreateMovementUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementsRepository = new InMemoryMovementsRepository();
    inMemoryAddressingsRepository = new InMemoryAddressingsRepository();
    inMemoryMovementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new CreateMovementUseCase(
      inMemoryUsersRepository,
      inMemoryMovementsRepository,
      inMemoryAddressingsRepository,
      inMemoryMovementTypesRepository,
    );
  });

  it('should create an IN movement and increment balance', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      amount: 10,
      active: true,
    });
    await inMemoryAddressingsRepository.create(addressing);

    const movementType = makeMovementType({
      companyId: user.companyId,
      direction: MovementDirection.IN,
    });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      movementTypeId: movementType.id.toString(),
      quantity: 5,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movement.quantity).toBe(5);
    }

    const updatedAddressing = inMemoryAddressingsRepository.items.find(
      (a) => a.id.toString() === addressing.id.toString(),
    );
    expect(updatedAddressing?.amount).toBe(15);
    expect(inMemoryMovementsRepository.items).toHaveLength(1);
  });

  it('should create an OUT movement and decrement balance', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      amount: 20,
      active: true,
    });
    await inMemoryAddressingsRepository.create(addressing);

    const movementType = makeMovementType({
      companyId: user.companyId,
      direction: MovementDirection.OUT,
    });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      movementTypeId: movementType.id.toString(),
      quantity: 8,
    });

    expect(result.isRight()).toBe(true);

    const updatedAddressing = inMemoryAddressingsRepository.items.find(
      (a) => a.id.toString() === addressing.id.toString(),
    );
    expect(updatedAddressing?.amount).toBe(12);
  });

  it('should return InsufficientBalanceError if balance is insufficient for OUT movement', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      amount: 5,
      active: true,
    });
    await inMemoryAddressingsRepository.create(addressing);

    const movementType = makeMovementType({
      companyId: user.companyId,
      direction: MovementDirection.OUT,
    });
    await inMemoryMovementTypesRepository.create(movementType);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      movementTypeId: movementType.id.toString(),
      quantity: 10,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InsufficientBalanceError);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-id',
      addressingId: 'any-id',
      movementTypeId: 'any-id',
      quantity: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return AddressingNotFoundError if addressing does not exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      addressingId: 'non-existent-id',
      movementTypeId: 'any-id',
      quantity: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingNotFoundError);
  });

  it('should return MovementTypeNotFoundError if movement type does not exist', async () => {
    const user = makeUser();
    await inMemoryUsersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      active: true,
    });
    await inMemoryAddressingsRepository.create(addressing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      movementTypeId: 'non-existent-id',
      quantity: 1,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MovementTypeNotFoundError);
  });
});
