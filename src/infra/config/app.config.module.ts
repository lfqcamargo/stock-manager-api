import { Module } from '@nestjs/common';

import { AppConfig } from '@/domain/shared/application/config/app-config';
import { EnvModule } from '@/infra/env/env.module';

import { EnvAppConfig } from './env-app-config';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: AppConfig,
      useClass: EnvAppConfig,
    },
  ],
  exports: [AppConfig],
})
export class AppConfigModule {}
