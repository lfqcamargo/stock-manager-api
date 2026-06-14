import { Body, Controller, HttpCode, Patch } from '@nestjs/common';

import { ExchangePasswordForTokenUseCase } from '@/domain/user/application/use-cases/exchange-password-for-token';
import { Public } from '@/infra/auth/public';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  ExchangePasswordForTokenBody,
} from './schemas/exchange-password-for-token-schema';

@Controller('/auth/exchange-password-for-token')
@Public()
export class ExchangePasswordForTokenController {
  constructor(
    private readonly _exchangePasswordForTokenUseCase: ExchangePasswordForTokenUseCase,
  ) {}

  @Patch()
  @HttpCode(200)
  async handle(@Body(bodyValidationPipe) body: ExchangePasswordForTokenBody) {
    const { token, password } = body;

    const result = await this._exchangePasswordForTokenUseCase.execute({
      token,
      password,
    });

    if (result.isLeft()) {
      throw mapUseCaseErrorToHttpException(result.value);
    }

    return { email: result.value.user.email };
  }
}
