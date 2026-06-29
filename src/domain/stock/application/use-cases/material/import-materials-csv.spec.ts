import { makeGroup } from 'test/factories/make-group';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryGroupsRepository } from 'test/repositories/in-memory-groups-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { ImportMaterialsCsvUseCase } from './import-materials-csv';

let usersRepository: InMemoryUsersRepository;
let groupsRepository: InMemoryGroupsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let sut: ImportMaterialsCsvUseCase;

describe('ImportMaterialsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    groupsRepository = new InMemoryGroupsRepository();
    materialsRepository = new InMemoryMaterialsRepository();
    sut = new ImportMaterialsCsvUseCase(
      usersRepository,
      groupsRepository,
      materialsRepository,
    );
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [{ groupCode: 'G1', code: 'M1', name: 'Material 1', unit: 'UN' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return UserNotAllowedError when user is EMPLOYEE', async () => {
    const user = makeUser({ role: UserRole.EMPLOYEE });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ groupCode: 'G1', code: 'M1', name: 'Material 1', unit: 'UN' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'INVALID_MODE',
      rows: [{ groupCode: 'G1', code: 'M1', name: 'Material 1', unit: 'UN' }],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidImportModeError);
  });

  it('should return InvalidCsvFormatError when rows is empty', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should return InvalidCsvFormatError when required column is missing', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ code: 'M1', name: 'Mat' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should skip rows where group does not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { groupCode: 'NONEXISTENT', code: 'M1', name: 'Mat 1', unit: 'UN' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
  });

  it('should skip rows with invalid unit measure', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'G1' });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ groupCode: 'G1', code: 'M1', name: 'Mat 1', unit: 'INVALID' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
  });

  it('should import materials with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'GRP1' });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          groupCode: 'GRP1',
          code: 'M001',
          name: 'Parafuso M6',
          unit: 'UN',
          active: 'true',
        },
        {
          groupCode: 'GRP1',
          code: 'M002',
          name: 'Porca M6',
          unit: 'PC',
          description: 'Desc',
          active: 'false',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(2);
      expect(result.value.skipped).toBe(0);
    }
    expect(materialsRepository.items).toHaveLength(2);
    expect(materialsRepository.items[0].code).toBe('M001');
    expect(materialsRepository.items[0].groupId.toString()).toBe(
      group.id.toString(),
    );
    expect(materialsRepository.items[1].active).toBe(false);
  });

  it('should skip existing materials in ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'GRP1' });
    await groupsRepository.create(group);

    const existing = makeMaterial({
      companyId: user.companyId,
      groupId: group.id,
      code: 'M001',
      name: 'Old Name',
    });
    await materialsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ groupCode: 'GRP1', code: 'M001', name: 'New Name', unit: 'UN' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(0);
      expect(result.value.skipped).toBe(1);
    }
    expect(materialsRepository.items[0].name).toBe('Old Name');
  });

  it('should update existing materials in UPDATE_EXISTING mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'GRP1' });
    await groupsRepository.create(group);

    const existing = makeMaterial({
      companyId: user.companyId,
      groupId: group.id,
      code: 'M001',
      name: 'Old Name',
    });
    await materialsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.UPDATE_EXISTING,
      rows: [
        {
          groupCode: 'GRP1',
          code: 'M001',
          name: 'Updated Name',
          unit: 'KG',
          active: 'false',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(1);
      expect(result.value.skipped).toBe(0);
    }
    expect(materialsRepository.items[0].name).toBe('Updated Name');
    expect(materialsRepository.items[0].unit.code).toBe('KG');
    expect(materialsRepository.items[0].active).toBe(false);
  });

  it('should delete all and reimport in RESET mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'GRP1' });
    await groupsRepository.create(group);

    const existing = makeMaterial({
      companyId: user.companyId,
      groupId: group.id,
      code: 'OLD',
      name: 'Old Material',
    });
    await materialsRepository.create(existing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [
        { groupCode: 'GRP1', code: 'NEW', name: 'New Material', unit: 'UN' },
      ],
    });

    expect(result.isRight()).toBe(true);
    expect(materialsRepository.items).toHaveLength(1);
    expect(materialsRepository.items[0].code).toBe('NEW');
  });

  it('should work for MANAGER role', async () => {
    const user = makeUser({ role: UserRole.MANAGER });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'GRP1' });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [{ groupCode: 'GRP1', code: 'M001', name: 'Material', unit: 'UN' }],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
  });

  it('should skip rows with empty required fields', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const group = makeGroup({ companyId: user.companyId, code: 'GRP1' });
    await groupsRepository.create(group);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        { groupCode: '', code: 'M1', name: 'Mat 1', unit: 'UN' },
        { groupCode: 'GRP1', code: '', name: 'Mat 2', unit: 'UN' },
        { groupCode: 'GRP1', code: 'M3', name: 'Valid', unit: 'UN' },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.imported).toBe(1);
      expect(result.value.skipped).toBe(2);
    }
  });
});
