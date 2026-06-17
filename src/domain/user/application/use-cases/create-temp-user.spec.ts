import { FakeHasher } from 'test/cryptography/fake-hasher';
import { makeUser } from 'test/factories/make-user';
import { InMemoryTempUsersRepository } from 'test/repositories/in-memory-temp-users-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserRole } from '../../enterprise/entities/user';
import { CreateTempUserUseCase } from './create-temp-user';
import { AlreadyExistsEmailError } from './errors/already-exists-email-error';
import { UserNotAdminError } from './errors/user-not-admin-error';
import { UserNotFoundError } from './errors/user-not-found-error';

let inMemoryTempUsersRepository: InMemoryTempUsersRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let hashGenerator: FakeHasher;
let sut: CreateTempUserUseCase;

describe('Create temp user use case', () => {
  beforeEach(() => {
    inMemoryTempUsersRepository = new InMemoryTempUsersRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    hashGenerator = new FakeHasher();

    sut = new CreateTempUserUseCase(
      inMemoryTempUsersRepository,
      inMemoryUsersRepository,
      hashGenerator,
    );
  });

  it('should be able to create a temp user', async () => {
    const user = makeUser({
      email: 'test@test.com',
      role: UserRole.ADMIN,
    });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      email: 'test@test.com.br',
      name: 'test',
      role: UserRole.ADMIN,
      password: 'password123',
    });

    expect(result.isRight()).toBe(true);

    const tempUser = inMemoryTempUsersRepository.items[0];
    expect(tempUser.id).toBeDefined();
    expect(tempUser.companyId.toString()).toBe(user.companyId.toString());
    expect(tempUser.email).toBe('test@test.com.br');
    expect(tempUser.name).toBe('test');
    expect(tempUser.role).toBe(UserRole.ADMIN);
    expect(tempUser.password).toBe('password123-hashed');
    expect(tempUser.expirationDate).toBeDefined();
  });

  it('should not be able to create a temp user with an already existing email', async () => {
    const user = makeUser({
      email: 'test@test.com',
      role: UserRole.ADMIN,
    });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      email: user.email,
      name: 'test',
      role: UserRole.ADMIN,
      password: 'password123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsEmailError);
  });

  it('should not be able to create a temp user with an authenticate user not admin', async () => {
    const user = makeUser({
      email: 'test@test.com',
      role: UserRole.EMPLOYEE,
    });
    await inMemoryUsersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      email: 'test@test.com.br',
      name: 'test',
      role: UserRole.ADMIN,
      password: 'password123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAdminError);
  });

  it('should not be able to create a temp user with an invalid authenticate id', async () => {
    const result = await sut.execute({
      authenticateId: 'invalid-id',
      email: 'test@test.com.br',
      name: 'test',
      role: UserRole.ADMIN,
      password: 'password123',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
