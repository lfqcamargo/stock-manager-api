import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindMaterialByIdUseCase } from '@/domain/stock/application/use-cases/material/find-material-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MaterialPresenter } from '@/infra/presenter/material-presenter';

import {
  FindMaterialByIdParams,
  paramsValidationPipe,
} from './schemas/find-material-by-id-schema';

@Controller('materials')
export class FindMaterialByIdController {
  constructor(
    private readonly _findMaterialByIdUseCase: FindMaterialByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindMaterialByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findMaterialByIdUseCase.execute({
      authenticateId: user.userId,
      materialId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return MaterialPresenter.toHTTP(result.value.material);
  }
}
