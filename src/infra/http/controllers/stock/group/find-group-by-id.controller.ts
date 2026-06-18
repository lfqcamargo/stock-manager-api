import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindGroupByIdUseCase } from '@/domain/stock/application/use-cases/group/find-group-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { GroupPresenter } from '@/infra/presenter/group-presenter';

import {
  FindGroupByIdParams,
  paramsValidationPipe,
} from './schemas/find-group-by-id-schema';

@Controller('groups')
export class FindGroupByIdController {
  constructor(private readonly _findGroupByIdUseCase: FindGroupByIdUseCase) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindGroupByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findGroupByIdUseCase.execute({
      authenticateId: user.userId,
      groupId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return GroupPresenter.toHTTP(result.value.group);
  }
}
