import { Module } from '@nestjs/common';

import { ConfirmationCreateUserUseCase } from '@/domain/user/application/use-cases/confirmation-create-user';
import { CreateTempUserUseCase } from '@/domain/user/application/use-cases/create-temp-user';
import { DeleteUserUseCase } from '@/domain/user/application/use-cases/delete-user';
import { EditCompanyUseCase } from '@/domain/user/application/use-cases/edit-company';
import { EditUserUseCase } from '@/domain/user/application/use-cases/edit-user';
import { FetchUsersCompanyIdUseCase } from '@/domain/user/application/use-cases/fetch-users';
import { GetProfileUserUseCase } from '@/domain/user/application/use-cases/get-profile-user';

import { AppConfigModule } from '../../../config/app.config.module';
import { CryptographyModule } from '../../../cryptography/cryptography.module';
import { DatabaseModule } from '../../../database/database.module';
import { EnvModule } from '../../../env/env.module';
import { EditCompanyController } from '../company/edit-company.controller';
import { ConfirmationCreateUserController } from './confirmation-create-user.controller';
import { CreateUserTempController } from './create-user-temp.controller';
import { DeleteUserController } from './delete-user.controller';
import { EditUserController } from './edit-user.controller';
import { FetchUsersController } from './fetch-users.controller';
import { GetProfileUserController } from './get-profile-user.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  controllers: [
    GetProfileUserController,
    CreateUserTempController,
    ConfirmationCreateUserController,
    EditUserController,
    EditCompanyController,
    FetchUsersController,
    DeleteUserController,
  ],
  providers: [
    GetProfileUserUseCase,
    CreateTempUserUseCase,
    ConfirmationCreateUserUseCase,
    EditUserUseCase,
    EditCompanyUseCase,
    FetchUsersCompanyIdUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
