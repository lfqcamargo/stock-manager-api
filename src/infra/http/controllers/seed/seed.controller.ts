import {
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';

import { EnvService } from '@/infra/env/env.service';

import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(
    private readonly _seedService: SeedService,
    private readonly _env: EnvService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(@Headers('x-seed-key') seedKey: string) {
    const masterPassword = this._env.get('PASSWORD_MASTER');

    if (!seedKey || seedKey !== masterPassword) {
      throw new ForbiddenException('Invalid seed key.');
    }

    const result = await this._seedService.run();
    return result;
  }
}
