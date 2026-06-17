import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';

import { ConfirmationCreateUserUseCase } from '@/domain/user/application/use-cases/confirmation-create-user';
import { Public } from '@/infra/auth/public';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  ConfirmationCreateUserParams,
  paramsValidationPipe,
} from './schemas/confirmation-create-user-schema';

@Controller('users/confirmation/:token')
@Public()
export class ConfirmationCreateUserController {
  constructor(
    private readonly _confirmationCreateUserUseCase: ConfirmationCreateUserUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param(paramsValidationPipe) params: ConfirmationCreateUserParams,
  ) {
    const { token } = params;

    const result = await this._confirmationCreateUserUseCase.execute({
      token,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return {
      email: result.value.user.email,
    };
  }
}
