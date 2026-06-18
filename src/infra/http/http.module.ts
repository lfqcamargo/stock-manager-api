import { Module } from '@nestjs/common';

import { AppConfigModule } from '../config/app.config.module';
import { AuthModule } from './controllers/auth/auth.module';
import { CompanyModule } from './controllers/company/company.module';
import { HealthModule } from './controllers/health/health.module';
import { StockModule } from './controllers/stock/stock.module';
import { UserModule } from './controllers/user/user.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    AppConfigModule,
    UserModule,
    CompanyModule,
    StockModule,
  ],
})
export class HttpModule {}
