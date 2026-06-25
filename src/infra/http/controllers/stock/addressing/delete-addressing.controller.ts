import { Controller, Delete, HttpCode, Param } from '@nestjs/common';

import { DeleteAddressingUseCase } from '@/domain/stock/application/use-cases/addressing/delete-addressing';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  DeleteAddressingParams,
  paramsValidationPipe,
} from './schemas/delete-addressing-schema';

@Controller('addressings')
export class DeleteAddressingController {
  constructor(
    private readonly _deleteAddressingUseCase: DeleteAddressingUseCase,
  ) {}

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Param(paramsValidationPipe) { id }: DeleteAddressingParams,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._deleteAddressingUseCase.execute({
      authenticateId: user.userId,
      addressingId: id,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
