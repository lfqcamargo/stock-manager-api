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

import { GroupNotFoundError } from '../group/errors/group-not-found-error';
import { CreateMaterialUseCase } from './create-material';
import { AlreadyExistsMaterialError } from './errors/already-exists-material-error';
import { InvalidUnitMeasureError } from './errors/invalid-unit-measure-error';

let usersRepository: InMemoryUsersRepository;
let groupsRepository: InMemoryGroupsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let createMaterial: CreateMaterialUseCase;

describe('Create Material Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    createMaterial = new CreateMaterialUseCase(
      usersRepository,
      groupsRepository,
      materialsRepository,
    );
  });

  it('should create a material when user is admin and group exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Steel Bar',
      description: 'teste',
      unit: 'CX',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    expect(materialsRepository.items).toHaveLength(1);
    expect(materialsRepository.items[0].code).toBe('CODE');
    expect(materialsRepository.items[0].name).toBe('Steel Bar');
    expect(materialsRepository.items[0].description).toBe('teste');
    expect(materialsRepository.items[0].unit.code).toBe('CX');
    expect(materialsRepository.items[0].active).toBe(true);
  });

  it('should create a material when user is manager and group exists', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Steel Bar',
      description: 'teste',
      unit: 'CX',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    expect(materialsRepository.items).toHaveLength(1);
    expect(materialsRepository.items[0].code).toBe('CODE');
    expect(materialsRepository.items[0].name).toBe('Steel Bar');
  });

  it('should return UserNotFoundError if user does not exist', async () => {
    const result = await createMaterial.execute({
      authenticateId: 'non-existent-id',
      groupId: 'any-group-id',
      code: 'CODE',
      name: 'Material X',
      unit: 'CX',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError if user is not admin or manager', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: 'any-group-id',
      code: 'CODE',
      name: 'Material Y',
      unit: 'CX',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return GroupNotFoundError if group does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: 'non-existent-group-id',
      code: 'CODE',
      name: 'Material Z',
      unit: 'CX',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(GroupNotFoundError);
  });

  it('should return AlreadyExistsMaterialError if material with same name exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const material = makeMaterial({
      companyId: user.companyId,
      name: 'Duplicated Material',
    });

    await materialsRepository.create(material);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Duplicated Material',
      unit: 'CX',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsMaterialError);
  });

  it('should return AlreadyExistsMaterialCodeError if material with same name exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const material = makeMaterial({
      companyId: user.companyId,
      code: 'CODE',
      name: 'Material',
    });

    await materialsRepository.create(material);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Material Code',
      unit: 'CX',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsMaterialError);
  });

  it('should return InvalidUnitMeasureError if unit non exists', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId });
    await groupsRepository.create(group);

    const result = await createMaterial.execute({
      authenticateId: user.id.toString(),
      groupId: group.id.toString(),
      code: 'CODE',
      name: 'Material',
      unit: 'NON-EXISTS',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidUnitMeasureError);
  });
});
