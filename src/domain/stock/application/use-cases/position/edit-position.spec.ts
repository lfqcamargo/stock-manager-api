import { makePosition } from 'test/factories/make-position';
import { makeUser } from 'test/factories/make-user';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditPositionUseCase } from './edit-position';
import { AlreadyExistsPositionError } from './errors/already-exists-position-error';
import { PositionNotFoundError } from './errors/position-not-found-error';

let usersRepository: InMemoryUsersRepository;
let positionsRepository: InMemoryPositionsRepository;
let editPositionUseCase: EditPositionUseCase;

describe('EditPositionUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    positionsRepository = new InMemoryPositionsRepository();

    editPositionUseCase = new EditPositionUseCase(
      usersRepository,
      positionsRepository,
    );
  });

  it('should edit a position successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const position = makePosition({
      companyId: user.companyId,
      code: 'OLD-001',
      name: 'Old Name',
    });
    await positionsRepository.create(position);

    const result = await editPositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position.id.toString(),
      code: 'NEW-001',
      name: 'New Name',
      description: 'New Description',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.position.name).toBe('New Name');
      expect(result.value.position.code).toBe('NEW-001');
      expect(result.value.position.description).toBe('New Description');
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await editPositionUseCase.execute({
      authenticateId: 'non-existent-user',
      positionId: 'any-position',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await editPositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: 'any-position',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return PositionNotFoundError if position does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await editPositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: 'non-existent-position',
      code: 'NEW-001',
      name: 'New Name',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PositionNotFoundError);
  });

  it('should return AlreadyExistsPositionError if name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const position1 = makePosition({
      companyId: user.companyId,
      code: 'POS-001',
      name: 'Position 1',
    });
    const position2 = makePosition({
      companyId: user.companyId,
      code: 'POS-002',
      name: 'Position 2',
    });

    await positionsRepository.create(position1);
    await positionsRepository.create(position2);

    const result = await editPositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position1.id.toString(),
      code: 'POS-001',
      name: 'Position 2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsPositionError);
  });

  it('should return AlreadyExistsPositionError if code already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const position1 = makePosition({
      companyId: user.companyId,
      code: 'POS-001',
      name: 'Position 1',
    });
    const position2 = makePosition({
      companyId: user.companyId,
      code: 'POS-002',
      name: 'Position 2',
    });

    await positionsRepository.create(position1);
    await positionsRepository.create(position2);

    const result = await editPositionUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position1.id.toString(),
      code: 'POS-002',
      name: 'Position 1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsPositionError);
  });
});
