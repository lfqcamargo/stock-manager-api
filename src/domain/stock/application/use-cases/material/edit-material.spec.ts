import { makeGroup } from 'test/factories/make-group';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { EditMaterialUseCase } from './edit-material';
import { AlreadyExistsMaterialError } from './errors/already-exists-material-error';
import { InvalidUnitMeasureError } from './errors/invalid-unit-measure-error';
import { MaterialNotFoundError } from './errors/material-not-found-error';

let usersRepository: InMemoryUsersRepository;
let groupsRepository: InMemoryGroupsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let sut: EditMaterialUseCase;

describe('EditMaterialUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    sut = new EditMaterialUseCase(
      usersRepository,
      groupsRepository,
      materialsRepository,
    );
  });

  it('should edit a material successfully when user is admin', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const material = makeMaterial({ companyId: user.companyId, active: true });
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
      groupId: material.groupId.toString(),
      code: 'CODE',
      name: 'New Material Name',
      description: 'teste',
      unit: 'KG',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.material.code).toBe('CODE');
      expect(result.value.material.name).toBe('New Material Name');
      expect(result.value.material.description).toBe('teste');
      expect(result.value.material.unit.code).toBe('KG');
      expect(result.value.material.active).toBe(true);
    }
  });

  it('should edit a material successfully when user is manager', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const material = makeMaterial({ companyId: user.companyId, active: true });
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
      groupId: material.groupId.toString(),
      code: 'CODE',
      name: 'New Material Name',
      description: 'teste',
      unit: 'KG',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.material.code).toBe('CODE');
      expect(result.value.material.name).toBe('New Material Name');
    }
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const material = makeMaterial();
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: 'non-existent-user',
      materialId: material.id.toString(),
      groupId: material.groupId.toString(),
      code: 'CODE',
      name: 'Name',
      description: null,
      unit: 'KG',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);
    const material = makeMaterial();
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
      groupId: material.groupId.toString(),
      code: 'CODE',
      name: 'Name',
      description: null,
      unit: 'KG',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return MaterialNotFoundError if material does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: 'non-existent-material',
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Name',
      description: null,
      unit: 'KG',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MaterialNotFoundError);
  });

  it('should return AlreadyExistsMaterialError if new name already exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const material = makeMaterial({
      companyId: user.companyId,
      name: 'Material A',
      groupId: group.id,
      active: true,
    });
    const otherMaterial = makeMaterial({
      companyId: user.companyId,
      name: 'Material B',
      groupId: group.id,
      active: true,
    });

    await materialsRepository.create(material);
    await materialsRepository.create(otherMaterial);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Material B',
      description: null,
      unit: 'KG',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsMaterialError);
  });

  it('should return InvalidUnitMeasureError unit non exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    const group = makeGroup({ companyId: user.companyId });

    const material = makeMaterial({
      companyId: user.companyId,
      groupId: group.id,
    });
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      materialId: material.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: material.name,
      description: null,
      unit: 'non-exits',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidUnitMeasureError);
  });
});
