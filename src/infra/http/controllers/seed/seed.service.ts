import { Injectable, Logger } from '@nestjs/common';

import { seedAddressing } from '@/../prisma/seeds/seed-addressing';
import { seedCompanies } from '@/../prisma/seeds/seed-companies';
import { seedGroups } from '@/../prisma/seeds/seed-groups';
import { seedMaterials } from '@/../prisma/seeds/seed-materials';
import { seedMovementTypes } from '@/../prisma/seeds/seed-movement-types';
import { seedMovements } from '@/../prisma/seeds/seed-movements';
import { seedUsers } from '@/../prisma/seeds/seed-users';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

@Injectable()
export class SeedService {
  private readonly _logger = new Logger(SeedService.name);

  constructor(private readonly _prisma: PrismaService) {}

  async run(): Promise<{ message: string; duration: string }> {
    const start = Date.now();
    this._logger.log('🌱 Starting database seed...');

    await this._prisma.$transaction(async (tx) => {
      this._logger.log('🗑️  Cleaning existing data...');

      await tx.movement.deleteMany();
      await tx.movementType.deleteMany();
      await tx.addressing.deleteMany();
      await tx.position.deleteMany();
      await tx.shelf.deleteMany();
      await tx.row.deleteMany();
      await tx.subLocation.deleteMany();
      await tx.location.deleteMany();
      await tx.user.deleteMany();
      await tx.material.deleteMany();
      await tx.group.deleteMany();
      await tx.company.deleteMany();

      // The seed functions accept PrismaClient — PrismaService extends it,
      // and the transaction client is compatible for all used operations.
      const prismaLike = tx as unknown as PrismaService;

      await seedCompanies(prismaLike);
      this._logger.log('✅ Companies seeded');

      await seedUsers(prismaLike);
      this._logger.log('✅ Users seeded');

      await seedGroups(prismaLike);
      this._logger.log('✅ Groups seeded');

      await seedMaterials(prismaLike);
      this._logger.log('✅ Materials seeded');
    });

    await seedAddressing(this._prisma);
    this._logger.log('✅ Addressings seeded');

    await seedMovementTypes(this._prisma);
    this._logger.log('✅ Movement types seeded');

    await seedMovements(this._prisma);
    this._logger.log('✅ Movements seeded');

    const duration = `${((Date.now() - start) / 1000).toFixed(1)}s`;
    this._logger.log(`🎉 Seed completed in ${duration}`);

    return { message: 'Seed completed successfully.', duration };
  }
}
