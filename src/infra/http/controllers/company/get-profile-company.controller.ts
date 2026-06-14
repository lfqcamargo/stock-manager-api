import { Controller, Get, HttpCode, NotFoundException } from '@nestjs/common';

import { CompanyNotFoundError } from '@/domain/user/application/use-cases/errors/company-not-found-error';
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error';
import { GetProfileCompanyUseCase } from '@/domain/user/application/use-cases/get-profile-company';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

@Controller('/companies/me')
export class GetProfileCompanyController {
  constructor(
    private readonly _getProfileCompanyUseCase: GetProfileCompanyUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this._getProfileCompanyUseCase.execute({
      companyId: user.companyId,
      userAuthenticateId: user.userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case CompanyNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new NotFoundException(error.message);
      }
    }

    const { company } = result.value;

    return {
      company: {
        id: company.id.toString(),
        name: company.name,
        cnpj: company.cnpj,
        photo: company.photo,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    };
  }
}
