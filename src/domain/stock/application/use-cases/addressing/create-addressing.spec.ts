import { UserNotAllowedError } from 'src/domain/user/application/use-cases/errors/user-not-allowed-error';
import { makeLocation } from 'test/factories/make-location';
import { makeMaterial } from 'test/factories/make-material';
import { makePosition } from 'test/factories/make-position';
import { makeRow } from 'test/factories/make-row';
import { makeShelf } from 'test/factories/make-shelf';
import { makeSubLocation } from 'test/factories/make-sub-location';
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

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';

import { LocationNotFoundError } from '../location/errors/location-not-found-error';
import { MaterialNotFoundError } from '../material/errors/material-not-found-error';
import { PositionNotFoundError } from '../position/errors/position-not-found-error';
import { RowNotFoundError } from '../row/errors/row-not-found-error';
import { ShelfNotFoundError } from '../shelf/errors/shelf-not-found-error';
import { SubLocationNotFoundError } from '../sub-location/errors/sub-location-not-found-error';
import { CreateAddressingUseCase } from './create-addressing';
import { AddressingAlreadyExistsError } from './errors/addressing-already-exists-error';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAddressingsRepository: InMemoryAddressingsRepository;
let inMemoryLocationsRepository: InMemoryLocationsRepository;
let inMemorySubLocationsRepository: InMemorySubLocationsRepository;
let inMemoryRowsRepository: InMemoryRowsRepository;
let inMemoryShelfsRepository: InMemoryShelfsRepository;
let inMemoryPositionsRepository: InMemoryPositionsRepository;
let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let createAddressingUseCase: CreateAddressingUseCase;

describe('Create addressing use case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryAddressingsRepository = new InMemoryAddressingsRepository();
    inMemoryLocationsRepository = new InMemoryLocationsRepository();
    inMemorySubLocationsRepository = new InMemorySubLocationsRepository(
      inMemoryLocationsRepository,
    );
    inMemoryRowsRepository = new InMemoryRowsRepository();
    inMemoryShelfsRepository = new InMemoryShelfsRepository();
    inMemoryPositionsRepository = new InMemoryPositionsRepository();
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();

    createAddressingUseCase = new CreateAddressingUseCase(
      inMemoryUsersRepository,
      inMemoryAddressingsRepository,
      inMemoryLocationsRepository,
      inMemorySubLocationsRepository,
      inMemoryRowsRepository,
      inMemoryShelfsRepository,
      inMemoryPositionsRepository,
      inMemoryMaterialsRepository,
    );
  });

  it('should be able to create an addressing', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const location = makeLocation({ companyId: adminUser.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: adminUser.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: adminUser.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: adminUser.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const position = makePosition({ companyId: adminUser.companyId });
    await inMemoryPositionsRepository.create(position);

    const result = await createAddressingUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
      active: true,
    });

    expect(result.isRight()).toBe(true);
    const addressing = inMemoryAddressingsRepository.items[0];

    expect(addressing).toBeDefined();
    expect(addressing.locationId.toString()).toBe(location.id.toString());
    expect(addressing.subLocationId.toString()).toBe(subLocation.id.toString());
    expect(addressing.rowId.toString()).toBe(row.id.toString());
    expect(addressing.shelfId.toString()).toBe(shelf.id.toString());
    expect(addressing.positionId.toString()).toBe(position.id.toString());
    expect(addressing.active).toBe(true);
  });

  it('should be able to create an addressing with material', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const location = makeLocation({ companyId: adminUser.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: adminUser.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: adminUser.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: adminUser.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const position = makePosition({ companyId: adminUser.companyId });
    await inMemoryPositionsRepository.create(position);

    const material = makeMaterial({ companyId: adminUser.companyId });
    await inMemoryMaterialsRepository.create(material);

    const result = await createAddressingUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
      materialId: material.id.toString(),
      active: true,
    });

    expect(result.isRight()).toBe(true);
    const addressing = inMemoryAddressingsRepository.items[0];

    expect(addressing.materialId).not.toBeNull();
    expect(addressing.materialId?.toString()).toBe(material.id.toString());
  });

  it('should not allow duplicate addressing for the same location/sub-location/row/shelf/position', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const location = makeLocation({ companyId: adminUser.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: adminUser.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: adminUser.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: adminUser.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const position = makePosition({ companyId: adminUser.companyId });
    await inMemoryPositionsRepository.create(position);

    const payload = {
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
    };

    const first = await createAddressingUseCase.execute(payload);
    expect(first.isRight()).toBe(true);

    const second = await createAddressingUseCase.execute(payload);
    expect(second.isLeft()).toBe(true);
    expect(second.value).toBeInstanceOf(AddressingAlreadyExistsError);
  });

  it('should allow two addressings with the same location/sub-location/row/shelf but different positions', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const location = makeLocation({ companyId: adminUser.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: adminUser.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: adminUser.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: adminUser.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const position1 = makePosition({ companyId: adminUser.companyId });
    const position2 = makePosition({ companyId: adminUser.companyId });
    await inMemoryPositionsRepository.create(position1);
    await inMemoryPositionsRepository.create(position2);

    const first = await createAddressingUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position1.id.toString(),
    });
    expect(first.isRight()).toBe(true);

    const second = await createAddressingUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position2.id.toString(),
    });
    expect(second.isRight()).toBe(true);

    expect(inMemoryAddressingsRepository.items).toHaveLength(2);
  });

  it('should not allow duplicate addressing regardless of material', async () => {
    const adminUser = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(adminUser);

    const location = makeLocation({ companyId: adminUser.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: adminUser.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: adminUser.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: adminUser.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const position = makePosition({ companyId: adminUser.companyId });
    await inMemoryPositionsRepository.create(position);

    const material = makeMaterial({ companyId: adminUser.companyId });
    await inMemoryMaterialsRepository.create(material);

    // Primeiro sem material
    const first = await createAddressingUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
    });
    expect(first.isRight()).toBe(true);

    // Segundo com material — mesmo endereço, deve ser bloqueado
    const second = await createAddressingUseCase.execute({
      authenticateId: adminUser.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
      materialId: material.id.toString(),
    });
    expect(second.isLeft()).toBe(true);
    expect(second.value).toBeInstanceOf(AddressingAlreadyExistsError);
  });

  it('should not create addressing if user is not found', async () => {
    const result = await createAddressingUseCase.execute({
      authenticateId: 'non-existent-id',
      locationId: 'any-location',
      subLocationId: 'any-sub-location',
      rowId: 'any-row',
      shelfId: 'any-shelf',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not create addressing if user is not admin or manager', async () => {
    const employee = makeUser({ role: UserRole.EMPLOYEE });
    await inMemoryUsersRepository.create(employee);

    const result = await createAddressingUseCase.execute({
      authenticateId: employee.id.toString(),
      locationId: 'any-location',
      subLocationId: 'any-sub-location',
      rowId: 'any-row',
      shelfId: 'any-shelf',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotAllowedError);
  });

  it('should not create addressing if location is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const result = await createAddressingUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: 'non-existent-location',
      subLocationId: 'any-sub-location',
      rowId: 'any-row',
      shelfId: 'any-shelf',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(LocationNotFoundError);
  });

  it('should not create addressing if sub-location is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const result = await createAddressingUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      subLocationId: 'non-existent-sub-location',
      rowId: 'any-row',
      shelfId: 'any-shelf',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(SubLocationNotFoundError);
  });

  it('should not create addressing if row is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: admin.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const result = await createAddressingUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: 'non-existent-row',
      shelfId: 'any-shelf',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RowNotFoundError);
  });

  it('should not create addressing if shelf is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: admin.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: admin.companyId });
    await inMemoryRowsRepository.create(row);

    const result = await createAddressingUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: 'non-existent-shelf',
      positionId: 'any-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ShelfNotFoundError);
  });

  it('should not create addressing if position is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: admin.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: admin.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: admin.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const result = await createAddressingUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: 'non-existent-position',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PositionNotFoundError);
  });

  it('should not create addressing if material is not found', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    await inMemoryUsersRepository.create(admin);

    const location = makeLocation({ companyId: admin.companyId });
    await inMemoryLocationsRepository.create(location);

    const subLocation = makeSubLocation({
      companyId: admin.companyId,
      locationId: location.id,
    });
    await inMemorySubLocationsRepository.create(subLocation);

    const row = makeRow({ companyId: admin.companyId });
    await inMemoryRowsRepository.create(row);

    const shelf = makeShelf({ companyId: admin.companyId });
    await inMemoryShelfsRepository.create(shelf);

    const position = makePosition({ companyId: admin.companyId });
    await inMemoryPositionsRepository.create(position);

    const result = await createAddressingUseCase.execute({
      authenticateId: admin.id.toString(),
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
      materialId: 'non-existent-material',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(MaterialNotFoundError);
  });
});
