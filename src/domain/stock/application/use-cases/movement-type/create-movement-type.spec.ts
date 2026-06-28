import { makeMovementType } from 'test/factories/make-movement-type';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMovementTypesRepository } from 'test/repositories/in-memory-movement-types-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { CreateMovementTypeUseCase } from './create-movement-type';
import { AlreadyExistsMovementTypeError } from './errors/already-exists-movement-type-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryMovementTypesRepository: InMemoryMovementTypesRepository;
let sut: CreateMovementTypeUseCase;

describe('CreateMovementTypeUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryMovementTypesRepository = new InMemoryMovementTypesRepository();
    sut = new CreateMovementTypeUseCase(
      inMemoryUsersRepository,
      inMemoryMovementTypesRepository,
    );
  });

  it('should create a movement type successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      name: 'Entrada de mercadoria',
      direction: MovementDirection.IN,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.movementType.name).toBe('Entrada de mercadoria');
      expect(result.value.movementType.direction).toBe(MovementDirection.IN);
      expect(result.value.movementType.companyId.toString()).toBe(
        user.companyId.toString(),
      );
    }
    expect(inMemoryMovementTypesRepository.items).toHaveLength(1);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-id',
      name: 'Entrada',
      direction: MovementDirection.IN,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      name: 'Entrada',
      direction: MovementDirection.IN,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return AlreadyExistsMovementTypeError if name already exists in the company', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(user);

    const existing = makeMovementType({
      companyId: user.companyId,
      name: 'Entrada',
    });
    await inMemoryMovementTypesRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      name: 'Entrada',
      direction: MovementDirection.IN,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsMovementTypeError);
  });
});
