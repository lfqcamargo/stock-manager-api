import { Module } from '@nestjs/common';

import { EmailsRepository } from '@/domain/notification/application/repositories/emails-repository';
import { CompaniesRepository } from '@/domain/user/application/repositories/companies-repository';
import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempPasswordTokensRepository } from '@/domain/user/application/repositories/temp-password-tokens-repository';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';

import { PrismaService } from './prisma/prisma.service';
import { PrismaCompaniesRepository } from './prisma/repositories/prisma-companies-repository';
import { PrismaEmailsRepository } from './prisma/repositories/prisma-emails-repository';
import { PrismaTempCompaniesRepository } from './prisma/repositories/prisma-temp-comapanies-repository';
import { PrismaTempPasswordTokensRepository } from './prisma/repositories/prisma-temp-password-tokens-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: TempCompaniesRepository,
      useClass: PrismaTempCompaniesRepository,
    },
    { provide: CompaniesRepository, useClass: PrismaCompaniesRepository },
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: EmailsRepository, useClass: PrismaEmailsRepository },
    {
      provide: TempPasswordTokensRepository,
      useClass: PrismaTempPasswordTokensRepository,
    },
  ],
  exports: [
    PrismaService,
    TempCompaniesRepository,
    CompaniesRepository,
    UsersRepository,
    EmailsRepository,
    TempPasswordTokensRepository,
  ],
})
export class DatabaseModule {}
