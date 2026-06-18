import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateGroupUseCase } from '@/domain/stock/application/use-cases/group/create-group';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateGroupBody,
} from './schemas/create-group-schema';

@Controller('groups')
export class CreateGroupController {
  constructor(private readonly _createGroupUseCase: CreateGroupUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateGroupBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createGroupUseCase.execute({
      authenticateId: user.userId,
      code: body.code,
      name: body.name,
      description: body.description,
      active: body.active,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
