import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindLocationByIdUseCase } from '@/domain/stock/application/use-cases/location/find-location-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { LocationPresenter } from '@/infra/presenter/location-presenter';

import {
  FindLocationByIdParams,
  paramsValidationPipe,
} from './schemas/find-location-by-id-schema';

@Controller('locations')
export class FindLocationByIdController {
  constructor(
    private readonly _findLocationByIdUseCase: FindLocationByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindLocationByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findLocationByIdUseCase.execute({
      authenticateId: user.userId,
      locationId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return LocationPresenter.toHTTP(result.value.location);
  }
}
