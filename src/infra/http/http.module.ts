import { Module } from '@nestjs/common';

import { AppConfigModule } from '../config/app.config.module';
import { AuthModule } from './controllers/auth/auth.module';
import { HealthModule } from './controllers/health/health.module';

@Module({
  imports: [HealthModule, AuthModule, AppConfigModule],
})
export class HttpModule {}
