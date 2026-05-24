export abstract class AppConfig {
  abstract get appUrl(): string;
  abstract get accessExpiresIn(): string;
  abstract get refreshExpiresIn(): string;
}
