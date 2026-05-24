import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { Public } from '@/infra/auth/public';

@Controller('/health')
export class HealthController {
  constructor() {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
