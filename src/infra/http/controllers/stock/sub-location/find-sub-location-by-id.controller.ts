import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindSubLocationByIdUseCase } from '@/domain/stock/application/use-cases/sub-location/find-sub-location-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { SubLocationPresenter } from '@/infra/presenter/sub-location-presenter';

import {
  FindSubLocationByIdParams,
  paramsValidationPipe,
} from './schemas/find-sub-location-by-id-schema';

@Controller('sub-locations')
export class FindSubLocationByIdController {
  constructor(
    private readonly _findSubLocationByIdUseCase: FindSubLocationByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindSubLocationByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findSubLocationByIdUseCase.execute({
      authenticateId: user.userId,
      subLocationId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return SubLocationPresenter.toHTTP(result.value.subLocation);
  }
}
