import { makeTempUser } from 'test/factories/make-temp-user';
import { makeUser } from 'test/factories/make-user';
import { InMemoryTempUsersRepository } from 'test/repositories/in-memory-temp-users-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { UserRole } from '../../enterprise/entities/user';
import { ConfirmationCreateUserUseCase } from './confirmation-create-user';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';
import { ResourceTokenNotFoundError } from './errors/resource-token-not-found-error';
import { TokenExpiratedError } from './errors/token-expirated-error';

let inMemoryTempUsersRepository: InMemoryTempUsersRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: ConfirmationCreateUserUseCase;

describe('Confirmation create user use case', () => {
  beforeEach(() => {
    inMemoryTempUsersRepository = new InMemoryTempUsersRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new ConfirmationCreateUserUseCase(
      inMemoryTempUsersRepository,
      inMemoryUsersRepository,
    );
  });

  it('should be able to confirm create user', async () => {
    const userTemp = makeTempUser({
      companyId: new UniqueEntityID('12345678901234'),
      name: 'Test User',
      email: 'test@test.com',
      role: UserRole.ADMIN,
    });

    await inMemoryTempUsersRepository.create(userTemp);

    const result = await sut.execute({
      token: userTemp.token,
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUsersRepository.items[0].email).toEqual(userTemp.email);
    expect(inMemoryUsersRepository.items[0].name).toEqual(userTemp.name);
    expect(inMemoryUsersRepository.items[0].role).toEqual(userTemp.role);
    expect(inMemoryUsersRepository.items[0].companyId).toEqual(
      userTemp.companyId,
    );
    expect(inMemoryTempUsersRepository.items.length).toBe(0);
  });

  it('should not be able to confirm create user with invalid token', async () => {
    const result = await sut.execute({
      token: 'invalid-token',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceTokenNotFoundError);
  });

  it('should not be able to confirm create user with expired token', async () => {
    const userTemp = makeTempUser({
      companyId: new UniqueEntityID('12345678901234'),
      name: 'Test User',
      email: 'test@test.com',
      expirationDate: new Date(Date.now() - 1000),
    });

    await inMemoryTempUsersRepository.create(userTemp);

    const result = await sut.execute({
      token: userTemp.token,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(TokenExpiratedError);
  });

  it('should not be able to confirm create user with already existing email', async () => {
    const userTemp = makeTempUser({
      companyId: new UniqueEntityID('12345678901234'),
      name: 'Test User',
      email: 'test@test.com',
      role: UserRole.ADMIN,
    });
    await inMemoryTempUsersRepository.create(userTemp);

    const existingUser = makeUser({ email: userTemp.email });
    await inMemoryUsersRepository.create(existingUser);

    const result = await sut.execute({
      token: userTemp.token,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsEmailError);
  });
});
