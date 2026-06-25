import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { CreateAddressingUseCase } from '@/domain/stock/application/use-cases/addressing/create-addressing';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  CreateAddressingBody,
} from './schemas/create-addressing-schema';

@Controller('addressings')
export class CreateAddressingController {
  constructor(
    private readonly _createAddressingUseCase: CreateAddressingUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async handle(
    @Body(bodyValidationPipe) body: CreateAddressingBody,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this._createAddressingUseCase.execute({
      authenticateId: user.userId,
      locationId: body.locationId,
      subLocationId: body.subLocationId,
      rowId: body.rowId,
      shelfId: body.shelfId,
      positionId: body.positionId,
      materialId: body.materialId,
      active: body.active,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
