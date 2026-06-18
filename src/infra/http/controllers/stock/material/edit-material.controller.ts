import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditMaterialUseCase } from '@/domain/stock/application/use-cases/material/edit-material';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditMaterialBody,
  EditMaterialParams,
  paramsValidationPipe,
} from './schemas/edit-material-schema';

@Controller('materials')
export class EditMaterialController {
  constructor(private readonly _editMaterialUseCase: EditMaterialUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditMaterialParams,
    @Body(bodyValidationPipe) body: EditMaterialBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editMaterialUseCase.execute({
      authenticateId: user.userId,
      materialId: id,
      groupId: body.groupId,
      code: body.code,
      name: body.name,
      description: body.description,
      unit: body.unit,
      active: body.active,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
