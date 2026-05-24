import { Module } from '@nestjs/common';

import { OnConfirmationCompanyCreated } from '@/domain/notification/application/subscribers/on-confirmation-company-created';
import { OnPasswordChanged } from '@/domain/notification/application/subscribers/on-password-changed';
import { OnTempCompanyCreated } from '@/domain/notification/application/subscribers/on-temp-company-created';
import { OnTempPasswordTokenCreated } from '@/domain/notification/application/subscribers/on-temp-password-token-created';
import { OnUpdateLastLoginUser } from '@/domain/user/application/subscribers/on-update-last-login-user';

import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [DatabaseModule, EmailModule, EnvModule],
  providers: [
    OnTempCompanyCreated,
    OnConfirmationCompanyCreated,
    OnUpdateLastLoginUser,
    OnTempPasswordTokenCreated,
    OnPasswordChanged,
  ],
})
export class EventModule {}
