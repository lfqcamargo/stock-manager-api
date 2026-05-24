import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user';
import { CredentialsError } from '@/domain/user/application/use-cases/errors/credentials-error';
import { Public } from '@/infra/auth/public';
import { EnvService } from '@/infra/env/env.service';

import { authCookieOptions } from '../../utils/auth-cookie-options';
import { expiresInToMilliseconds } from '../../utils/expires-in-to-ms';
import {
  AuthenticateUserBody,
  bodyValidationPipe,
} from './schemas/authenticate-user-schema';

@Controller('/auth/session')
@Public()
export class AuthenticateUserController {
  constructor(
    private readonly _env: EnvService,
    private readonly _authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body(bodyValidationPipe) body: AuthenticateUserBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = body;

    const result = await this._authenticateUserUseCase.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case CredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new UnauthorizedException(error.message);
      }
    }

    const { accessToken, refreshToken } = result.value;

    const accessMaxAge = expiresInToMilliseconds(
      this._env.get('JWT_ACCESS_EXPIRES_IN'),
    );
    const refreshMaxAge = expiresInToMilliseconds(
      this._env.get('JWT_REFRESH_EXPIRES_IN'),
    );

    res.cookie('token', accessToken, authCookieOptions(accessMaxAge));
    res.cookie('refresh_token', refreshToken, authCookieOptions(refreshMaxAge));

    return {
      message: 'Logged in',
    };
  }
}
