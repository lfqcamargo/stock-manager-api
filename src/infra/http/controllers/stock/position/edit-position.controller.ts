import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditPositionUseCase } from '@/domain/stock/application/use-cases/position/edit-position';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import { bodyValidationPipe, EditPositionBody, EditPositionParams, paramsValidationPipe } from './schemas/edit-position-schema';

@Controller('positions')
export class EditPositionController {
  constructor(private readonly _editPositionUseCase: EditPositionUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(@Param(paramsValidationPipe) { id }: EditPositionParams, @Body(bodyValidationPipe) body: EditPositionBody, @CurrentUser() user: UserPayload) {
    const result = await this._editPositionUseCase.execute({
      authenticateId: user.userId,
      positionId: id,
      code: body.code,
      name: body.name,
      description: body.description,
    });
    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
