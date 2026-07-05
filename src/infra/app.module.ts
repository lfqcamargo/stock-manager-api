import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EventModule } from './event/event.module';
import { HttpModule } from './http/http.module';
import { CustomThrottlerGuard } from './throttler/throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      envFilePath: process.env.ENV_FILE || '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: configService.get<number>('RATE_LIMIT_SHORT', 10), // 10 requests per minute
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: configService.get<number>('RATE_LIMIT_MEDIUM', 100), // 100 requests per minute
        },
        {
          name: 'long',
          ttl: 900000, // 15 minute
          limit: configService.get<number>('RATE_LIMIT_LONG', 1000), // 1000 requests per minute
        },
      ],
      inject: [ConfigService],
    }),
    AuthModule,
    EnvModule,
    EmailModule,
    EventModule,
    HttpModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
