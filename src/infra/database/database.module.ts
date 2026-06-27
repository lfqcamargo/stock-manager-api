import { Module } from '@nestjs/common';

import { EmailsRepository } from '@/domain/notification/application/repositories/emails-repository';
import { AddressingsRepository } from '@/domain/stock/application/repositories/addressings-repository';
import { GroupsRepository } from '@/domain/stock/application/repositories/groups-repository';
import { LocationsRepository } from '@/domain/stock/application/repositories/locations-repository';
import { MaterialsRepository } from '@/domain/stock/application/repositories/materials-repository';
import { MovementTypesRepository } from '@/domain/stock/application/repositories/movement-types-repository';
import { MovementsRepository } from '@/domain/stock/application/repositories/movements-repository';
import { PositionsRepository } from '@/domain/stock/application/repositories/positions-repository';
import { RowsRepository } from '@/domain/stock/application/repositories/rows-repository';
import { ShelfsRepository } from '@/domain/stock/application/repositories/shelfs-repository';
import { SubLocationsRepository } from '@/domain/stock/application/repositories/sub-locations-repository';
import { CompaniesRepository } from '@/domain/user/application/repositories/companies-repository';
import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempPasswordTokensRepository } from '@/domain/user/application/repositories/temp-password-tokens-repository';
import { TempUsersRepository } from '@/domain/user/application/repositories/temp-users-repository';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';

import { PrismaService } from './prisma/prisma.service';
import { PrismaAddressingsRepository } from './prisma/repositories/prisma-addressings-repository';
import { PrismaCompaniesRepository } from './prisma/repositories/prisma-companies-repository';
import { PrismaEmailsRepository } from './prisma/repositories/prisma-emails-repository';
import { PrismaGroupsRepository } from './prisma/repositories/prisma-groups-repository';
import { PrismaLocationsRepository } from './prisma/repositories/prisma-locations-repository';
import { PrismaMaterialsRepository } from './prisma/repositories/prisma-materials-repository';
import { PrismaMovementTypesRepository } from './prisma/repositories/prisma-movement-types-repository';
import { PrismaMovementsRepository } from './prisma/repositories/prisma-movements-repository';
import { PrismaPositionsRepository } from './prisma/repositories/prisma-positions-repository';
import { PrismaRowsRepository } from './prisma/repositories/prisma-rows-repository';
import { PrismaShelfsRepository } from './prisma/repositories/prisma-shelfs-repository';
import { PrismaSubLocationsRepository } from './prisma/repositories/prisma-sub-locations-repository';
import { PrismaTempCompaniesRepository } from './prisma/repositories/prisma-temp-comapanies-repository';
import { PrismaTempPasswordTokensRepository } from './prisma/repositories/prisma-temp-password-tokens-repository';
import { PrismaTempUsersRepository } from './prisma/repositories/prisma-temp-users-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: TempCompaniesRepository,
      useClass: PrismaTempCompaniesRepository,
    },
    {
      provide: TempUsersRepository,
      useClass: PrismaTempUsersRepository,
    },
    { provide: CompaniesRepository, useClass: PrismaCompaniesRepository },
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: EmailsRepository, useClass: PrismaEmailsRepository },
    {
      provide: TempPasswordTokensRepository,
      useClass: PrismaTempPasswordTokensRepository,
    },
    { provide: GroupsRepository, useClass: PrismaGroupsRepository },
    { provide: MaterialsRepository, useClass: PrismaMaterialsRepository },
    { provide: LocationsRepository, useClass: PrismaLocationsRepository },
    { provide: SubLocationsRepository, useClass: PrismaSubLocationsRepository },
    { provide: RowsRepository, useClass: PrismaRowsRepository },
    { provide: ShelfsRepository, useClass: PrismaShelfsRepository },
    { provide: PositionsRepository, useClass: PrismaPositionsRepository },
    { provide: AddressingsRepository, useClass: PrismaAddressingsRepository },
    {
      provide: MovementTypesRepository,
      useClass: PrismaMovementTypesRepository,
    },
    { provide: MovementsRepository, useClass: PrismaMovementsRepository },
  ],
  exports: [
    PrismaService,
    TempCompaniesRepository,
    TempUsersRepository,
    CompaniesRepository,
    UsersRepository,
    EmailsRepository,
    TempPasswordTokensRepository,
    GroupsRepository,
    MaterialsRepository,
    LocationsRepository,
    SubLocationsRepository,
    RowsRepository,
    ShelfsRepository,
    PositionsRepository,
    AddressingsRepository,
    MovementTypesRepository,
    MovementsRepository,
  ],
})
export class DatabaseModule {}
