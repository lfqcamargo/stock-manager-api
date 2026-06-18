import { UserNotAllowedError } from 'src/domain/user/application/use-cases/errors/user-not-allowed-error';
import { makeGroup } from 'test/factories/make-group';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { CreateGroupUseCase } from './create-group';
import { AlreadyExistsGroupError } from './errors/already-exists-group-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let createGroupUseCase: CreateGroupUseCase;

describe('Create group use case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryGroupsRepository = new InMemoryGroupsRepository();

    createGroupUseCase = new CreateGroupUseCase(
      inMemoryUsersRepository,
      inMemoryGroupsRepository,
    );
  });

  it('should be able to create a group', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const result = await createGroupUseCase.execute({
      authenticateId: adminUser.id.toString(),
      code: 'ABC',
      name: 'Finance',
      description: 'Teste',
      active: true,
    });

    expect(result.isRight()).toBe(true);
    const group = inMemoryGroupsRepository.items[0];

    expect(group).toBeDefined();
    expect(group.code).toBe('ABC');
    expect(group.name).toBe('Finance');
    expect(group.description).toBe('Teste');
    expect(group.active).toBe(true);
    expect(group.companyId.toString()).toBe(adminUser.companyId.toString());
  });

  it('should not create group if user is not found', async () => {
    const result = await createGroupUseCase.execute({
      authenticateId: 'non-existent-id',
      code: 'ABC',
      name: 'Finance',
      description: 'Teste',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create group if user is not admin', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createGroupUseCase.execute({
      authenticateId: employee.id.toString(),
      code: 'ABC',
      name: 'Finance',
      description: 'Teste',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create group if name already exists in the company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const group = makeGroup({ companyId: admin.companyId, name: 'Finance' });
    await inMemoryGroupsRepository.create(group);

    const result = await createGroupUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'ABC',
      name: 'Finance',
      description: 'Teste',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsGroupError);
  });

  it('should not create group if code already exists in the company', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const group = makeGroup({ companyId: admin.companyId, name: 'Finance' });
    await inMemoryGroupsRepository.create(group);

    const result = await createGroupUseCase.execute({
      authenticateId: admin.id.toString(),
      code: 'ABC',
      name: 'Finance',
      description: 'Teste',
      active: true,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AlreadyExistsGroupError);
  });
});
