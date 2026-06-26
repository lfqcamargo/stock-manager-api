import { makePosition } from 'test/factories/make-position';
import { makeUser } from 'test/factories/make-user';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';

import { PositionNotFoundError } from './errors/position-not-found-error';
import { FindPositionByIdUseCase } from './find-position-by-id';

describe('FindPositionByIdUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let positionsRepository: InMemoryPositionsRepository;
  let findPositionByIdUseCase: FindPositionByIdUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    positionsRepository = new InMemoryPositionsRepository();
    findPositionByIdUseCase = new FindPositionByIdUseCase(
      usersRepository,
      positionsRepository,
    );
  });

  it('should be able to find a position', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const position = makePosition({ companyId: user.companyId });
    await positionsRepository.create(position);

    const result = await findPositionByIdUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: position.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ position });
  });

  it('should return error if user does not exist', async () => {
    const result = await findPositionByIdUseCase.execute({
      authenticateId: 'non-existent',
      positionId: 'any',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if position does not exist', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await findPositionByIdUseCase.execute({
      authenticateId: user.id.toString(),
      positionId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PositionNotFoundError);
  });
});
