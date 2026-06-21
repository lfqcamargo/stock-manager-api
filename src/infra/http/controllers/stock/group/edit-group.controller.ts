import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditGroupUseCase } from '@/domain/stock/application/use-cases/group/edit-group';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditGroupBody,
  EditGroupParams,
  paramsValidationPipe,
} from './schemas/edit-group-schema';

@Controller('groups')
export class EditGroupController {
  constructor(private readonly _editGroupUseCase: EditGroupUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditGroupParams,
    @Body(bodyValidationPipe) body: EditGroupBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editGroupUseCase.execute({
      authenticateId: user.userId,
      groupId: id,
      code: body.code,
      name: body.name,
      description: body.description,
      active: body.active,
      photoUrl: body.photoUrl,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
