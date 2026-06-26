import { makeAddressing } from 'test/factories/make-addressing';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { MaterialNotFoundError } from '../material/errors/material-not-found-error';
import { EditAddressingUseCase } from './edit-addressing';
import { AddressingNotFoundError } from './errors/addressing-not-found-error';

let usersRepository: InMemoryUsersRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let editAddressingUseCase: EditAddressingUseCase;

describe('EditAddressingUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    addressingsRepository = new InMemoryAddressingsRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    editAddressingUseCase = new EditAddressingUseCase(
      usersRepository,
      addressingsRepository,
      materialsRepository,
    );
  });

  it('should edit an addressing successfully', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      active: true,
    });
    await addressingsRepository.create(addressing);

    const result = await editAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      active: false,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.addressing.active).toBe(false);
    }
  });

  it('should edit an addressing to add a material', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const addressing = makeAddressing({
      companyId: user.companyId,
      materialId: null,
    });
    await addressingsRepository.create(addressing);

    const material = makeMaterial({ companyId: user.companyId });
    await materialsRepository.create(material);

    const result = await editAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      active: true,
      materialId: material.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.addressing.materialId).not.toBeNull();
      expect(result.value.addressing.materialId?.toString()).toBe(
        material.id.toString(),
      );
    }
  });

  it('should edit an addressing to remove a material', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const material = makeMaterial({ companyId: user.companyId });
    await materialsRepository.create(material);

    const addressing = makeAddressing({
      companyId: user.companyId,
      materialId: material.id,
    });
    await addressingsRepository.create(addressing);

    const result = await editAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      active: true,
      materialId: null,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.addressing.materialId).toBeNull();
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await editAddressingUseCase.execute({
      authenticateId: 'non-existent-user',
      addressingId: 'any-addressing',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await editAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: 'any-addressing',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return AddressingNotFoundError if addressing does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await editAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: 'non-existent-addressing',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingNotFoundError);
  });

  it('should return MaterialNotFoundError if material does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const addressing = makeAddressing({ companyId: user.companyId });
    await addressingsRepository.create(addressing);

    const result = await editAddressingUseCase.execute({
      authenticateId: user.id.toString(),
      addressingId: addressing.id.toString(),
      active: true,
      materialId: 'non-existent-material',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MaterialNotFoundError);
  });
});
