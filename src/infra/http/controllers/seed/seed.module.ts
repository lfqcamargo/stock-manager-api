import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/infra/database/database.module';
import { EnvModule } from '@/infra/env/env.module';

import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [DatabaseModule, EnvModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
