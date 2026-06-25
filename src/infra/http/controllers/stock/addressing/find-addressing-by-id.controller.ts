import { Controller, Get, HttpCode, Param } from '@nestjs/common';

import { FindAddressingByIdUseCase } from '@/domain/stock/application/use-cases/addressing/find-addressing-by-id';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';
import { AddressingPresenter } from '@/infra/presenter/addressing-presenter';

import {
  FindAddressingByIdParams,
  paramsValidationPipe,
} from './schemas/find-addressing-by-id-schema';

@Controller('addressings')
export class FindAddressingByIdController {
  constructor(
    private readonly _findAddressingByIdUseCase: FindAddressingByIdUseCase,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async handle(
    @Param(paramsValidationPipe) { id }: FindAddressingByIdParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._findAddressingByIdUseCase.execute({
      authenticateId: user.userId,
      addressingId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);

    return AddressingPresenter.toHTTP(result.value.addressing);
  }
}
