import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

interface GetDashboardUseCaseRequest {
  authenticatedId: string;
}

export interface MovementByDay {
  date: string;
  in: number;
  out: number;
}

export interface LowStockItem {
  materialId: string;
  materialName: string;
  materialCode: string;
  totalAmount: number;
  addressingCount: number;
}

export interface RecentMovement {
  id: string;
  quantity: number;
  date: string;
  direction: 'IN' | 'OUT';
  movementTypeName: string;
  materialName: string | null;
  addressingLocation: string;
}

export interface DashboardData {
  kpis: {
    totalMaterials: number;
    activeMaterials: number;
    totalLocations: number;
    totalAddressings: number;
    activeAddressings: number;
    totalMovementsThisMonth: number;
    inMovementsThisMonth: number;
    outMovementsThisMonth: number;
    totalUsers: number;
    activeUsers: number;
  };
  movementsByDay: MovementByDay[];
  lowStockItems: LowStockItem[];
  recentMovements: RecentMovement[];
}

type GetDashboardUseCaseResponse = Either<UserNotFoundError, DashboardData>;

@Injectable()
export class GetDashboardUseCase {
  constructor(
    private readonly _usersRepository: UsersRepository,
    private readonly _prisma: PrismaService,
  ) {}

  async execute({
    authenticatedId,
  }: GetDashboardUseCaseRequest): Promise<GetDashboardUseCaseResponse> {
    const user = await this._usersRepository.findById(authenticatedId);
    if (!user) return left(new UserNotFoundError());

    const companyId = user.companyId.toString();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Run all queries in parallel
    const [
      totalMaterials,
      activeMaterials,
      totalLocations,
      totalAddressings,
      activeAddressings,
      totalUsers,
      activeUsers,
      movementsThisMonth,
      movementsLast30Days,
      addressingsWithMaterial,
      recentMovementsRaw,
    ] = await Promise.all([
      // KPIs
      this._prisma.material.count({ where: { companyId } }),
      this._prisma.material.count({ where: { companyId, active: true } }),
      this._prisma.location.count({ where: { companyId } }),
      this._prisma.addressing.count({ where: { companyId } }),
      this._prisma.addressing.count({ where: { companyId, active: true } }),
      this._prisma.user.count({ where: { companyId } }),
      this._prisma.user.count({ where: { companyId, active: true } }),

      // Movements this month with type direction
      this._prisma.movement.findMany({
        where: {
          companyId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { movementTypeId: true },
      }),

      // Movements in the last 30 days for the chart
      this._prisma.movement.findMany({
        where: {
          companyId,
          date: { gte: thirtyDaysAgo },
        },
        select: { date: true, movementTypeId: true },
        orderBy: { date: 'asc' },
      }),

      // Low stock: addressings with material, sorted by amount asc
      this._prisma.addressing.findMany({
        where: {
          companyId,
          active: true,
          materialId: { not: null },
        },
        select: {
          amount: true,
          materialId: true,
          material: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { amount: 'asc' },
        take: 100,
      }),

      // Recent movements
      this._prisma.movement.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          quantity: true,
          date: true,
          movementTypeId: true,
          addressingId: true,
        },
      }),
    ]);

    // Resolve movement type directions in batch
    const allMovementTypeIds = [
      ...new Set([
        ...movementsThisMonth.map((m) => m.movementTypeId),
        ...movementsLast30Days.map((m) => m.movementTypeId),
        ...recentMovementsRaw.map((m) => m.movementTypeId),
      ]),
    ];

    const movementTypes = await this._prisma.movementType.findMany({
      where: { id: { in: allMovementTypeIds } },
      select: { id: true, name: true, direction: true },
    });
    const movementTypeMap = new Map(movementTypes.map((mt) => [mt.id, mt]));

    // Count in/out for this month
    let inMovementsThisMonth = 0;
    let outMovementsThisMonth = 0;
    for (const m of movementsThisMonth) {
      const mt = movementTypeMap.get(m.movementTypeId);
      if (mt?.direction === 'IN') inMovementsThisMonth++;
      else outMovementsThisMonth++;
    }

    // Build movements by day chart (last 30 days)
    const dayMap = new Map<string, { in: number; out: number }>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { in: 0, out: 0 });
    }
    for (const m of movementsLast30Days) {
      const key = new Date(m.date).toISOString().slice(0, 10);
      const entry = dayMap.get(key);
      if (entry) {
        const mt = movementTypeMap.get(m.movementTypeId);
        if (mt?.direction === 'IN') entry.in++;
        else entry.out++;
      }
    }
    const movementsByDay: MovementByDay[] = Array.from(dayMap.entries()).map(
      ([date, counts]) => ({ date, ...counts }),
    );

    // Low stock items — aggregate by material
    const materialAmountMap = new Map<
      string,
      { name: string; code: string; totalAmount: number; addressingCount: number }
    >();
    for (const a of addressingsWithMaterial) {
      if (!a.material) continue;
      const existing = materialAmountMap.get(a.material.id);
      if (existing) {
        existing.totalAmount += a.amount;
        existing.addressingCount++;
      } else {
        materialAmountMap.set(a.material.id, {
          name: a.material.name,
          code: a.material.code,
          totalAmount: a.amount,
          addressingCount: 1,
        });
      }
    }
    const lowStockItems: LowStockItem[] = Array.from(materialAmountMap.entries())
      .map(([materialId, data]) => ({ materialId, materialName: data.name, materialCode: data.code, ...data }))
      .sort((a, b) => a.totalAmount - b.totalAmount)
      .slice(0, 5);

    // Resolve addressing details for recent movements
    const addressingIds = [...new Set(recentMovementsRaw.map((m) => m.addressingId))];
    const addressings = await this._prisma.addressing.findMany({
      where: { id: { in: addressingIds } },
      select: {
        id: true,
        material: { select: { name: true } },
        location: { select: { name: true } },
      },
    });
    const addressingMap = new Map(addressings.map((a) => [a.id, a]));

    const recentMovements: RecentMovement[] = recentMovementsRaw.map((m) => {
      const mt = movementTypeMap.get(m.movementTypeId);
      const addr = addressingMap.get(m.addressingId);
      return {
        id: m.id,
        quantity: m.quantity,
        date: m.date.toISOString(),
        direction: (mt?.direction ?? 'IN') as 'IN' | 'OUT',
        movementTypeName: mt?.name ?? '',
        materialName: addr?.material?.name ?? null,
        addressingLocation: addr?.location?.name ?? '',
      };
    });

    return right({
      kpis: {
        totalMaterials,
        activeMaterials,
        totalLocations,
        totalAddressings,
        activeAddressings,
        totalMovementsThisMonth: movementsThisMonth.length,
        inMovementsThisMonth,
        outMovementsThisMonth,
        totalUsers,
        activeUsers,
      },
      movementsByDay,
      lowStockItems,
      recentMovements,
    });
  }
}
