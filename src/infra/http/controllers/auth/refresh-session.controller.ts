import {
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { RefreshTokenUseCase } from '@/domain/user/application/use-cases/refresh-token';
import { Public } from '@/infra/auth/public';
import { EnvService } from '@/infra/env/env.service';
import { authCookieOptions } from '@/infra/http/utils/auth-cookie-options';
import { expiresInToMilliseconds } from '@/infra/http/utils/expires-in-to-ms';

import { mapUseCaseErrorToHttpException } from '../../errors/map-use-case-error';

@Controller()
@Public()
export class RefreshSessionController {
  constructor(
    private readonly _refreshTokenUseCase: RefreshTokenUseCase,
    private readonly _env: EnvService,
  ) {}

  @Post('/auth/session/refresh')
  @HttpCode(200)
  async handle(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    const result = await this._refreshTokenUseCase.execute({ refreshToken });

    if (result.isLeft()) {
      throw mapUseCaseErrorToHttpException(result.value);
    }

    const { accessToken, refreshToken: newRefreshToken } = result.value;

    const accessMaxAge = expiresInToMilliseconds(
      this._env.get('JWT_ACCESS_EXPIRES_IN'),
    );
    const refreshMaxAge = expiresInToMilliseconds(
      this._env.get('JWT_REFRESH_EXPIRES_IN'),
    );

    res.cookie('token', accessToken, authCookieOptions(accessMaxAge));
    res.cookie(
      'refresh_token',
      newRefreshToken,
      authCookieOptions(refreshMaxAge),
    );

    return {
      message: 'Tokens refreshed',
    };
  }
}
