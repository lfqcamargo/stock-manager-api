import { Body, Controller, HttpCode, Put } from '@nestjs/common';

import { EditCompanyUseCase } from '@/domain/user/application/use-cases/edit-company';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { mapUseCaseErrorToHttpException } from '@/infra/http/errors/map-use-case-error';

import {
  bodyValidationPipe,
  EditCompanyBody,
} from './schemas/edit-company-schema';

@Controller('companies')
export class EditCompanyController {
  constructor(private readonly _editCompanyUseCase: EditCompanyUseCase) {}

  @Put()
  @HttpCode(204)
  @Roles(UserRole.ADMIN)
  async handle(
    @Body(bodyValidationPipe) body: EditCompanyBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { companyId, userId } = user;

    const result = await this._editCompanyUseCase.execute({
      companyId,
      authenticateUserId: userId,
      name: body.name,
      photoUrl: body.photoUrl ?? null,
    });

    if (result.isLeft()) throw mapUseCaseErrorToHttpException(result.value);
  }
}
