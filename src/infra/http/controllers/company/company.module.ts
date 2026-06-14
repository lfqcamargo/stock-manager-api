import { Module } from '@nestjs/common';

import { GetProfileCompanyUseCase } from '@/domain/user/application/use-cases/get-profile-company';

import { AppConfigModule } from '../../../config/app.config.module';
import { CryptographyModule } from '../../../cryptography/cryptography.module';
import { DatabaseModule } from '../../../database/database.module';
import { EnvModule } from '../../../env/env.module';
import { GetProfileCompanyController } from './get-profile-company.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  controllers: [GetProfileCompanyController],
  providers: [GetProfileCompanyUseCase],
})
export class CompanyModule {}
