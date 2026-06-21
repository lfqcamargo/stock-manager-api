import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateMaterialUseCase } from '@/domain/stock/application/use-cases/material/create-material';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateMaterialBody,
} from './schemas/create-material-schema';

@Controller('materials')
export class CreateMaterialController {
  constructor(private readonly _createMaterialUseCase: CreateMaterialUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateMaterialBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createMaterialUseCase.execute({
      authenticateId: user.userId,
      groupId: body.groupId,
      code: body.code,
      name: body.name,
      description: body.description,
      unit: body.unit,
      active: body.active,
      photoUrl: body.photoUrl,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
