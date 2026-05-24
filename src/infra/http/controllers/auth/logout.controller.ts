import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import type { Response } from 'express';

const clearOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite:
    process.env.NODE_ENV === 'production'
      ? ('none' as const)
      : ('lax' as const),
  path: '/',
};

@Controller('auth/session/logout')
export class LogoutController {
  @Get()
  @HttpCode(200)
  handle(@Res() res: Response) {
    res.clearCookie('token', clearOpts);
    res.clearCookie('refresh_token', clearOpts);

    return res.send({ message: 'Logged out' });
  }
}
