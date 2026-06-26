import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditShelfUseCase } from '@/domain/stock/application/use-cases/shelf/edit-shelf';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditShelfBody,
  EditShelfParams,
  paramsValidationPipe,
} from './schemas/edit-shelf-schema';

@Controller('shelfs')
export class EditShelfController {
  constructor(private readonly _editShelfUseCase: EditShelfUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditShelfParams,
    @Body(bodyValidationPipe) body: EditShelfBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editShelfUseCase.execute({
      authenticateId: user.userId,
      shelfId: id,
      code: body.code,
      name: body.name,
      description: body.description,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
