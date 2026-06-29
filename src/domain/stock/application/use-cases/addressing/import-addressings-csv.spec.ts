import { makeLocation } from 'test/factories/make-location';
import { makeMaterial } from 'test/factories/make-material';
import { makeUser } from 'test/factories/make-user';
import { InMemoryAddressingsRepository } from 'test/repositories/in-memory-addressings-repository';
import { InMemoryLocationsRepository } from 'test/repositories/in-memory-locations-repository';
import { InMemoryMaterialsRepository } from 'test/repositories/in-memory-materials-repository';
import { InMemoryPositionsRepository } from 'test/repositories/in-memory-positions-repository';
import { InMemoryRowsRepository } from 'test/repositories/in-memory-rows-repository';
import { InMemoryShelfsRepository } from 'test/repositories/in-memory-shelfs-repository';
import { InMemorySubLocationsRepository } from 'test/repositories/in-memory-sub-locations-repository';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it } from 'vitest';

import { InvalidCsvFormatError } from '@/domain/shared/csv/errors/invalid-csv-format-error';
import { InvalidImportModeError } from '@/domain/shared/csv/errors/invalid-import-mode-error';
import { ImportMode } from '@/domain/shared/csv/import-mode';
import { Addressing } from '@/domain/stock/enterprise/entities/addressing';
import { Position } from '@/domain/stock/enterprise/entities/position';
import { Row } from '@/domain/stock/enterprise/entities/row';
import { Shelf } from '@/domain/stock/enterprise/entities/shelf';
import { SubLocation } from '@/domain/stock/enterprise/entities/sub-location';
import { UserNotAllowedError } from '@/domain/user/application/use-cases/errors/user-not-allowed-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { AddressingHasBalanceError } from './errors/addressing-has-balance-error';
import { ImportAddressingsCsvUseCase } from './import-addressings-csv';

let usersRepository: InMemoryUsersRepository;
let locationsRepository: InMemoryLocationsRepository;
let subLocationsRepository: InMemorySubLocationsRepository;
let rowsRepository: InMemoryRowsRepository;
let shelfsRepository: InMemoryShelfsRepository;
let positionsRepository: InMemoryPositionsRepository;
let addressingsRepository: InMemoryAddressingsRepository;
let materialsRepository: InMemoryMaterialsRepository;
let sut: ImportAddressingsCsvUseCase;

describe('ImportAddressingsCsv Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    locationsRepository = new InMemoryLocationsRepository();
    subLocationsRepository = new InMemorySubLocationsRepository(
      locationsRepository,
    );
    rowsRepository = new InMemoryRowsRepository();
    shelfsRepository = new InMemoryShelfsRepository();
    positionsRepository = new InMemoryPositionsRepository();
    addressingsRepository = new InMemoryAddressingsRepository();
    materialsRepository = new InMemoryMaterialsRepository();

    sut = new ImportAddressingsCsvUseCase(
      usersRepository,
      locationsRepository,
      subLocationsRepository,
      rowsRepository,
      shelfsRepository,
      positionsRepository,
      addressingsRepository,
      materialsRepository,
    );
  });

  const createAddressSetup = async (user: any) => {
    const companyId = user.companyId;
    const location = makeLocation({ companyId, code: 'L1' });
    const subLocation = SubLocation.create({
      companyId,
      locationId: location.id,
      code: 'SL1',
      name: 'Sub 1',
    });
    const row = Row.create({ companyId, code: 'R1', name: 'Row 1' });
    const shelf = Shelf.create({ companyId, code: 'S1', name: 'Shelf 1' });
    const position = Position.create({ companyId, code: 'P1', name: 'Pos 1' });

    await locationsRepository.create(location);
    await subLocationsRepository.create(subLocation);
    await rowsRepository.create(row);
    await shelfsRepository.create(shelf);
    await positionsRepository.create(position);

    return { location, subLocation, row, shelf, position };
  };

  it('should return UserNotFoundError when user does not exist', async () => {
    const result = await sut.execute({
      authenticateId: 'nonexistent',
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
        },
      ],
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
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
        },
      ],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should return InvalidImportModeError for unknown mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: 'BAD',
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
        },
      ],
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
      rows: [{ locationCode: 'L1', subLocationCode: 'SL1' } as any],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCsvFormatError);
  });

  it('should skip rows where location/sub/row/shelf/position do not exist', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          locationCode: 'NOEXIST',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
  });

  it('should import addressings with ADD_NEW mode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    await createAddressSetup(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(addressingsRepository.items).toHaveLength(1);
  });

  it('should skip rows with non-existent materialCode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    await createAddressSetup(user);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
          materialCode: 'NONEXISTENT',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.skipped).toBe(1);
  });

  it('should import addressing with valid materialCode', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    await createAddressSetup(user);

    const material = makeMaterial({
      companyId: user.companyId,
      code: 'MAT001',
    });
    await materialsRepository.create(material);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.ADD_NEW,
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
          materialCode: 'MAT001',
        },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) expect(result.value.imported).toBe(1);
    expect(addressingsRepository.items[0].materialId?.toString()).toBe(
      material.id.toString(),
    );
  });

  it('should return AddressingHasBalanceError on RESET when there is stock', async () => {
    const user = makeUser({ role: UserRole.ADMIN });
    await usersRepository.create(user);
    const { location, subLocation, row, shelf, position } =
      await createAddressSetup(user);

    const addressing = Addressing.create({
      companyId: user.companyId,
      locationId: location.id,
      subLocationId: subLocation.id,
      rowId: row.id,
      shelfId: shelf.id,
      positionId: position.id,
      amount: 10,
      active: true,
    });
    await addressingsRepository.create(addressing);

    const result = await sut.execute({
      authenticateId: user.id.toString(),
      mode: ImportMode.RESET,
      rows: [
        {
          locationCode: 'L1',
          subLocationCode: 'SL1',
          rowCode: 'R1',
          shelfCode: 'S1',
          positionCode: 'P1',
        },
      ],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AddressingHasBalanceError);
  });
});
