import { AppConfig } from '@/domain/shared/application/config/app-config';

export class FakeAppConfig implements AppConfig {
  get appUrl(): string {
    return 'http://localhost:3000';
  }

  get accessExpiresIn(): string {
    return '15m';
  }
  get refreshExpiresIn(): string {
    return '7d';
  }
}
