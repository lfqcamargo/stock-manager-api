import { Module } from '@nestjs/common';

import { EditCompanyUseCase } from '@/domain/user/application/use-cases/edit-company';
import { GetProfileCompanyUseCase } from '@/domain/user/application/use-cases/get-profile-company';

import { AppConfigModule } from '../../../config/app.config.module';
import { CryptographyModule } from '../../../cryptography/cryptography.module';
import { DatabaseModule } from '../../../database/database.module';
import { EnvModule } from '../../../env/env.module';
import { EditCompanyController } from './edit-company.controller';
import { GetProfileCompanyController } from './get-profile-company.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  controllers: [GetProfileCompanyController, EditCompanyController],
  providers: [GetProfileCompanyUseCase, EditCompanyUseCase],
})
export class CompanyModule {}
