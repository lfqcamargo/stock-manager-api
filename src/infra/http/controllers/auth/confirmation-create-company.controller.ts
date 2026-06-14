import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { ConfirmationCreateUserUseCase } from '@/domain/user/application/use-cases/confirmation-create-company';
import { Public } from '@/infra/auth/public';

import {
  bodyValidationPipe,
  ConfirmationCreateCompanyBody,
} from './schemas/confirmation-create-company-schema';

@Controller('/auth/confirmation-create-company')
@Public()
export class ConfirmationCreateCompanyController {
  constructor(
    private readonly _confirmationCreateUserUseCase: ConfirmationCreateUserUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: ConfirmationCreateCompanyBody) {
    const { token } = body;

    const result = await this._confirmationCreateUserUseCase.execute({ token });

    if (result.isLeft()) {
      console.log(result.value instanceof Error);
    }

    return result.value;
  }
}
