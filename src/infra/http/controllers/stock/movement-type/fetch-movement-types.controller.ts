import { Controller, Get, HttpCode, Query } from '@nestjs/common';

import { FetchMovementTypesUseCase } from '@/domain/stock/application/use-cases/movement-type/fetch-movement-types';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { MovementTypePresenter } from '@/infra/presenter/movement-type-presenter';

import {
  FetchMovementTypesQuery,
  queryValidationPipe,
} from './schemas/fetch-movement-types-schema';

@Controller('movement-types')
export class FetchMovementTypesController {
  constructor(
    private readonly _fetchMovementTypesUseCase: FetchMovementTypesUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(
    @Query(queryValidationPipe) query: FetchMovementTypesQuery,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._fetchMovementTypesUseCase.execute({
      authenticatedId: user.userId,
      name: query.name,
      direction: query.direction,
      orderBy:
        query.orderBy && query.orderDirection
          ? { field: query.orderBy, direction: query.orderDirection }
          : undefined,
      page: query.page,
      itemsPerPage: query.itemsPerPage,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    const { movementTypes, meta } = result.value;

    return {
      movementTypes: movementTypes.map((mt) =>
        MovementTypePresenter.toHTTP(mt),
      ),
      meta,
    };
  }
}
