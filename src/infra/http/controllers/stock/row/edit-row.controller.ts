import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditRowUseCase } from '@/domain/stock/application/use-cases/row/edit-row';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import { bodyValidationPipe, EditRowBody, EditRowParams, paramsValidationPipe } from './schemas/edit-row-schema';

@Controller('rows')
export class EditRowController {
  constructor(private readonly _editRowUseCase: EditRowUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(@Param(paramsValidationPipe) { id }: EditRowParams, @Body(bodyValidationPipe) body: EditRowBody, @CurrentUser() user: UserPayload) {
    const result = await this._editRowUseCase.execute({
      authenticateId: user.userId,
      rowId: id,
      code: body.code,
      name: body.name,
      description: body.description,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
