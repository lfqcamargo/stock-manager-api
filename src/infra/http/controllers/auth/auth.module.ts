import { Module } from '@nestjs/common';

import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user';
import { ConfirmationCreateCompanyUserUseCase } from '@/domain/user/application/use-cases/confirmation-create-company';
import { CreateTempCompanyUseCase } from '@/domain/user/application/use-cases/create-temp-company';
import { ExchangePasswordForTokenUseCase } from '@/domain/user/application/use-cases/exchange-password-for-token';
import { GenerateNewPasswordTokenUseCase } from '@/domain/user/application/use-cases/generate-new-password-token';
import { RefreshTokenUseCase } from '@/domain/user/application/use-cases/refresh-token';

import { AppConfigModule } from '../../../config/app.config.module';
import { CryptographyModule } from '../../../cryptography/cryptography.module';
import { DatabaseModule } from '../../../database/database.module';
import { EnvModule } from '../../../env/env.module';
import { AuthenticateUserController } from './authenticate-user.controller';
import { ConfirmationCreateCompanyController } from './confirmation-create-company.controller';
import { CreateTempCompanyController } from './create-temp-company.controller';
import { ExchangePasswordForTokenController } from './exchange-password-for-token.controller';
import { GenerateNewPasswordTokenController } from './generate-new-password-token.controller';
import { LogoutController } from './logout.controller';
import { RefreshSessionController } from './refresh-session.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  providers: [
    CreateTempCompanyUseCase,
    ConfirmationCreateCompanyUserUseCase,
    AuthenticateUserUseCase,
    GenerateNewPasswordTokenUseCase,
    ExchangePasswordForTokenUseCase,
    RefreshTokenUseCase,
  ],
  controllers: [
    CreateTempCompanyController,
    ConfirmationCreateCompanyController,
    AuthenticateUserController,
    LogoutController,
    GenerateNewPasswordTokenController,
    ExchangePasswordForTokenController,
    RefreshSessionController,
  ],
})
export class AuthModule {}
