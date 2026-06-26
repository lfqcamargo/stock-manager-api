import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreatePositionUseCase } from '@/domain/stock/application/use-cases/position/create-position';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreatePositionBody,
} from './schemas/create-position-schema';

@Controller('positions')
export class CreatePositionController {
  constructor(private readonly _createPositionUseCase: CreatePositionUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreatePositionBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createPositionUseCase.execute({
      authenticateId: user.userId,
      code: body.code,
      name: body.name,
      description: body.description,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
