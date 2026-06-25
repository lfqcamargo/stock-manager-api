import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';

import { EditAddressingUseCase } from '@/domain/stock/application/use-cases/addressing/edit-addressing';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditAddressingBody,
  EditAddressingParams,
  paramsValidationPipe,
} from './schemas/edit-addressing-schema';

@Controller('addressings')
export class EditAddressingController {
  constructor(private readonly _editAddressingUseCase: EditAddressingUseCase) {}

  @Put(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: EditAddressingParams,
    @Body(bodyValidationPipe) body: EditAddressingBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._editAddressingUseCase.execute({
      authenticateId: user.userId,
      addressingId: id,
      active: body.active,
      materialId: body.materialId,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
