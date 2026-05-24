import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateTempCompanyUseCase } from '@/domain/user/application/use-cases/create-temp-company';
import { Public } from '@/infra/auth/public';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateTempCompanyBody,
} from './schemas/create-temp-company-schema';

@Controller('/auth/create-temp-company')
@Public()
export class CreateTempCompanyController {
  constructor(
    private readonly _createTempCompanyUseCase: CreateTempCompanyUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateTempCompanyBody) {
    const { companyName, companyCnpj, userName, userEmail, userPassword } =
      body;

    const result = await this._createTempCompanyUseCase.execute({
      companyName,
      companyCnpj,
      userName,
      userEmail,
      userPassword,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
