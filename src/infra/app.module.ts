import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EventModule } from './event/event.module';
import { HttpModule } from './http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      envFilePath: process.env.ENV_FILE || '.env',
    }),
    AuthModule,
    EnvModule,
    EmailModule,
    EventModule,
    HttpModule,
  ],
})
export class AppModule {}
