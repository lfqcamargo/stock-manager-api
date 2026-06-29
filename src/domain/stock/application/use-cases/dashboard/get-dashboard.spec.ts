import { makeUser } from 'test/factories/make-user';
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import type { PrismaService } from '@/infra/database/prisma/prisma.service';

import { GetDashboardUseCase } from './get-dashboard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal PrismaService mock that satisfies every call the use-case makes. */
function makePrismaMock(overrides: Partial<ReturnType<typeof buildDefaultMock>> = {}) {
  const defaults = buildDefaultMock();
  const merged = { ...defaults, ...overrides };

  return {
    material: { count: vi.fn().mockResolvedValue(merged.materialCount) },
    location: { count: vi.fn().mockResolvedValue(merged.locationCount) },
    addressing: {
      count: vi.fn().mockResolvedValue(merged.addressingCount),
      findMany: vi.fn().mockResolvedValue(merged.addressingsWithMaterial),
    },
    user: { count: vi.fn().mockResolvedValue(merged.userCount) },
    movement: {
      findMany: vi
        .fn()
        // 1st call → movementsThisMonth
        .mockResolvedValueOnce(merged.movementsThisMonth)
        // 2nd call → movementsLast30Days
        .mockResolvedValueOnce(merged.movementsLast30Days)
        // 3rd call → recentMovementsRaw
        .mockResolvedValueOnce(merged.recentMovementsRaw),
    },
    movementType: {
      findMany: vi.fn().mockResolvedValue(merged.movementTypes),
    },
  } as unknown as PrismaService;
}

function buildDefaultMock() {
  const typeIdIn = new UniqueEntityID().toString();
  const typeIdOut = new UniqueEntityID().toString();
  const addressingId = new UniqueEntityID().toString();
  const materialId = new UniqueEntityID().toString();
  const today = new Date();

  return {
    materialCount: 10,
    locationCount: 4,
    addressingCount: 6,
    userCount: 3,
    movementsThisMonth: [
      { movementTypeId: typeIdIn },
      { movementTypeId: typeIdIn },
      { movementTypeId: typeIdOut },
    ],
    movementsLast30Days: [
      { date: today, movementTypeId: typeIdIn },
      { date: today, movementTypeId: typeIdOut },
    ],
    addressingsWithMaterial: [
      {
        amount: 2,
        materialId,
        material: { id: materialId, name: 'Parafuso', code: 'P001' },
      },
    ],
    recentMovementsRaw: [
      {
        id: new UniqueEntityID().toString(),
        quantity: 5,
        date: today,
        movementTypeId: typeIdIn,
        addressingId,
      },
    ],
    movementTypes: [
      { id: typeIdIn, name: 'Entrada', direction: 'IN' },
      { id: typeIdOut, name: 'Saída', direction: 'OUT' },
    ],
    // extra ids exposed so tests can reuse them
    _typeIdIn: typeIdIn,
    _typeIdOut: typeIdOut,
    _addressingId: addressingId,
    _materialId: materialId,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

let usersRepository: InMemoryUsersRepository;
let sut: GetDashboardUseCase;

describe('GetDashboardUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it('should return UserNotFoundError when user does not exist', async () => {
    sut = new GetDashboardUseCase(usersRepository, makePrismaMock());

    const result = await sut.execute({ authenticatedId: 'non-existent' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return correct KPIs aggregated from all counts', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const mock = buildDefaultMock();
    const prisma = makePrismaMock(mock);
    sut = new GetDashboardUseCase(usersRepository, prisma);

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    const { kpis } = result.value;

    // material counts — mock returns same value for both total and active
    expect(kpis.totalMaterials).toBe(mock.materialCount);
    expect(kpis.activeMaterials).toBe(mock.materialCount);
    expect(kpis.totalLocations).toBe(mock.locationCount);
    expect(kpis.totalAddressings).toBe(mock.addressingCount);
    expect(kpis.activeAddressings).toBe(mock.addressingCount);
    expect(kpis.totalUsers).toBe(mock.userCount);
    expect(kpis.activeUsers).toBe(mock.userCount);

    // 3 movements this month: 2 IN + 1 OUT
    expect(kpis.totalMovementsThisMonth).toBe(3);
    expect(kpis.inMovementsThisMonth).toBe(2);
    expect(kpis.outMovementsThisMonth).toBe(1);
  });

  it('should return movementsByDay with exactly 30 entries', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    sut = new GetDashboardUseCase(usersRepository, makePrismaMock());

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    expect(result.value.movementsByDay).toHaveLength(30);
    // every entry must have the expected shape
    result.value.movementsByDay.forEach((entry) => {
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('in');
      expect(entry).toHaveProperty('out');
      expect(typeof entry.in).toBe('number');
      expect(typeof entry.out).toBe('number');
    });
  });

  it('should correctly count in/out movements in the chart', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const typeIdIn = new UniqueEntityID().toString();
    const typeIdOut = new UniqueEntityID().toString();
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    const prisma = makePrismaMock({
      movementsThisMonth: [],
      movementsLast30Days: [
        { date: today, movementTypeId: typeIdIn },
        { date: today, movementTypeId: typeIdIn },
        { date: today, movementTypeId: typeIdOut },
      ],
      recentMovementsRaw: [],
      movementTypes: [
        { id: typeIdIn, name: 'Entrada', direction: 'IN' },
        { id: typeIdOut, name: 'Saída', direction: 'OUT' },
      ],
    });

    sut = new GetDashboardUseCase(usersRepository, prisma);

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    const todayEntry = result.value.movementsByDay.find(
      (e) => e.date === todayKey,
    );
    expect(todayEntry).toBeDefined();
    expect(todayEntry!.in).toBe(2);
    expect(todayEntry!.out).toBe(1);
  });

  it('should return lowStockItems sorted by totalAmount ascending (max 5)', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const ids = Array.from({ length: 7 }, () => new UniqueEntityID().toString());
    const addressings = ids.map((id, i) => ({
      amount: 10 - i, // 10, 9, 8, 7, 6, 5, 4 — will be sorted asc
      materialId: id,
      material: { id, name: `Mat ${i}`, code: `C${i}` },
    }));

    const prisma = makePrismaMock({
      addressingsWithMaterial: addressings,
      movementsThisMonth: [],
      movementsLast30Days: [],
      recentMovementsRaw: [],
      movementTypes: [],
    });

    sut = new GetDashboardUseCase(usersRepository, prisma);

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    const { lowStockItems } = result.value;

    // capped at 5
    expect(lowStockItems).toHaveLength(5);
    // sorted ascending
    for (let i = 1; i < lowStockItems.length; i++) {
      expect(lowStockItems[i].totalAmount).toBeGreaterThanOrEqual(
        lowStockItems[i - 1].totalAmount,
      );
    }
  });

  it('should aggregate multiple addressings for the same material', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const materialId = new UniqueEntityID().toString();
    const prisma = makePrismaMock({
      addressingsWithMaterial: [
        {
          amount: 3,
          materialId,
          material: { id: materialId, name: 'Parafuso', code: 'P001' },
        },
        {
          amount: 7,
          materialId,
          material: { id: materialId, name: 'Parafuso', code: 'P001' },
        },
      ],
      movementsThisMonth: [],
      movementsLast30Days: [],
      recentMovementsRaw: [],
      movementTypes: [],
    });

    sut = new GetDashboardUseCase(usersRepository, prisma);

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    const { lowStockItems } = result.value;
    expect(lowStockItems).toHaveLength(1);
    expect(lowStockItems[0].totalAmount).toBe(10);
    expect(lowStockItems[0].addressingCount).toBe(2);
  });

  it('should build recentMovements with correct direction and metadata', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const typeIdIn = new UniqueEntityID().toString();
    const addressingId = new UniqueEntityID().toString();
    const movId = new UniqueEntityID().toString();
    const today = new Date();

    const prisma = makePrismaMock({
      movementsThisMonth: [],
      movementsLast30Days: [],
      recentMovementsRaw: [
        {
          id: movId,
          quantity: 15,
          date: today,
          movementTypeId: typeIdIn,
          addressingId,
        },
      ],
      movementTypes: [{ id: typeIdIn, name: 'Compra', direction: 'IN' }],
      addressingsWithMaterial: [],
    });

    // make addressing.findMany return details for the recent movement
    (prisma.addressing.findMany as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]) // first call: low-stock
      .mockResolvedValueOnce([   // second call: recent-movements
        {
          id: addressingId,
          material: { name: 'Parafuso' },
          location: { name: 'Depósito A' },
        },
      ]);

    sut = new GetDashboardUseCase(usersRepository, prisma);

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    const [mov] = result.value.recentMovements;
    expect(mov.id).toBe(movId);
    expect(mov.quantity).toBe(15);
    expect(mov.direction).toBe('IN');
    expect(mov.movementTypeName).toBe('Compra');
    expect(mov.materialName).toBe('Parafuso');
    expect(mov.addressingLocation).toBe('Depósito A');
  });

  it('should return empty recentMovements and lowStockItems when no data', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const prisma = makePrismaMock({
      movementsThisMonth: [],
      movementsLast30Days: [],
      addressingsWithMaterial: [],
      recentMovementsRaw: [],
      movementTypes: [],
    });

    sut = new GetDashboardUseCase(usersRepository, prisma);

    const result = await sut.execute({ authenticatedId: user.id.toString() });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) return;

    expect(result.value.recentMovements).toHaveLength(0);
    expect(result.value.lowStockItems).toHaveLength(0);
    expect(result.value.kpis.totalMovementsThisMonth).toBe(0);
    expect(result.value.kpis.inMovementsThisMonth).toBe(0);
    expect(result.value.kpis.outMovementsThisMonth).toBe(0);
  });
});
