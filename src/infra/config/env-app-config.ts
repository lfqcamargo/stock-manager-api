import { Injectable } from '@nestjs/common';

import { AppConfig } from '@/domain/shared/application/config/app-config';
import { EnvService } from '@/infra/env/env.service';

@Injectable()
export class EnvAppConfig implements AppConfig {
  constructor(private readonly envService: EnvService) {}

  get appUrl(): string {
    return this.envService.get('APP_URL');
  }

  get accessExpiresIn(): string {
    return this.envService.get('JWT_ACCESS_EXPIRES_IN');
  }

  get refreshExpiresIn(): string {
    return this.envService.get('JWT_REFRESH_EXPIRES_IN');
  }
}
