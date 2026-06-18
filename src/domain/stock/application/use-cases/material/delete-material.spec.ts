import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { DeleteMaterialUseCase } from '../material/delete-material';
import { MaterialNotFoundError } from './errors/material-not-found-error';

let usersRepository: InMemoryUsersRepository;
let materialsRepository: InMemoryMaterialsRepository;
let sut: DeleteMaterialUseCase;

describe('DeleteMaterialUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    sut = new DeleteMaterialUseCase(usersRepository, materialsRepository);
  });

  it('should delete a material successfully when user is admin', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const material = makeMaterial({ companyId: user.companyId });
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(materialsRepository.items).toHaveLength(0);
  });

  it('should delete a material successfully when user is manager', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const material = makeMaterial({ companyId: user.companyId });
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(materialsRepository.items).toHaveLength(0);
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'non-existent-user',
      materialId: 'any-material',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: 'any-material',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return MaterialNotFoundError if material does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: 'non-existent-material',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MaterialNotFoundError);
  });
});
