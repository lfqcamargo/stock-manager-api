import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import z from 'zod';

import { DeleteUserUseCase } from '@/domain/user/application/use-cases/delete-user';
import { NotAllowedError } from '@/domain/user/application/use-cases/errors/not-allowed-error';
import { UserNotAdminError } from '@/domain/user/application/use-cases/errors/user-not-admin-error';
import { UserNotBelongToCompanyError } from '@/domain/user/application/use-cases/errors/user-not-belong-to-company-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';

const deleteUserParamsSchema = z.object({
  id: z.string(),
});

type DeleteUserParams = z.infer<typeof deleteUserParamsSchema>;

const paramsValidationPipe = new ZodValidationPipe(deleteUserParamsSchema);

@Controller('users/:id')
export class DeleteUserController {
  constructor(private deleteUserUseCase: DeleteUserUseCase) {}

  @Delete()
  @HttpCode(204)
  @Roles(UserRole.ADMIN)
  async handle(
    @Param(paramsValidationPipe) params: DeleteUserParams,
    @CurrentUser() user: UserPayload,
  ) {
    const { userId } = user;

    const result = await this.deleteUserUseCase.execute({
      userId: params.id,
      authenticatedUserId: userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof UserNotAdminError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof UserNotBelongToCompanyError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }

      throw new InternalServerErrorException('Unexpected error');
    }
  }
}
