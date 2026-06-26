import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateShelfUseCase } from '@/domain/stock/application/use-cases/shelf/create-shelf';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateShelfBody,
} from './schemas/create-shelf-schema';

@Controller('shelfs')
export class CreateShelfController {
  constructor(private readonly _createShelfUseCase: CreateShelfUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateShelfBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createShelfUseCase.execute({
      authenticateId: user.userId,
      code: body.code,
      name: body.name,
      description: body.description,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
