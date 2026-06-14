import { Module } from '@nestjs/common';

import { GetProfileUserUseCase } from '@/domain/user/application/use-cases/get-profile-user';

import { AppConfigModule } from '../../../config/app.config.module';
import { CryptographyModule } from '../../../cryptography/cryptography.module';
import { DatabaseModule } from '../../../database/database.module';
import { EnvModule } from '../../../env/env.module';
import { GetProfileUserController } from './get-profile-user.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule, AppConfigModule, EnvModule],
  controllers: [GetProfileUserController],
  providers: [GetProfileUserUseCase],
})
export class UserModule {}
