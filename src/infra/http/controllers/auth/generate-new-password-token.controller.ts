import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { GenerateNewPasswordTokenUseCase } from '@/domain/user/application/use-cases/generate-new-password-token';
import { Public } from '@/infra/auth/public';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  GenerateNewPasswordTokenBody,
} from './schemas/generate-new-password-token-schema';

@Controller('/auth/generate-new-password-token')
@Public()
export class GenerateNewPasswordTokenController {
  constructor(
    private readonly _generateNewPasswordTokenUseCase: GenerateNewPasswordTokenUseCase,
  ) {}

  @Post()
  @HttpCode(204)
  async handle(@Body(bodyValidationPipe) body: GenerateNewPasswordTokenBody) {
    const { email } = body;

    const result = await this._generateNewPasswordTokenUseCase.execute({
      email,
    });

    if (result.isLeft()) {
      throw mapUseCaseErrorToHttpException(result.value);
    }
  }
}
