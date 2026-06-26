import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateRowUseCase } from '@/domain/stock/application/use-cases/row/create-row';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import { bodyValidationPipe, CreateRowBody } from './schemas/create-row-schema';

@Controller('rows')
export class CreateRowController {
  constructor(private readonly _createRowUseCase: CreateRowUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateRowBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createRowUseCase.execute({
      authenticateId: user.userId,
      code: body.code,
      name: body.name,
      description: body.description,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
