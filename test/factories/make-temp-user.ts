import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  TempUser,
  TempUserProps,
} from '@/domain/user/enterprise/entities/temp-user';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { PrismaTempUserMapper } from '@/infra/database/prisma/mappers/prisma-temp-user-mapper';

export function makeTempUser(
  override: Partial<TempUserProps> = {},
  id?: UniqueEntityID,
) {
  const tempUser = TempUser.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRole.EMPLOYEE,
      companyId: new UniqueEntityID(),
      token: faker.string.uuid(),
      expirationDate: faker.date.future(),
      ...override,
    },
    id,
  );

  return tempUser;
}

@Injectable()
export class TempUserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaTempUser(
    data: Partial<TempUserProps> = {},
  ): Promise<TempUser> {
    const user = makeTempUser(data);

    await this.prisma.tempUser.create({
      data: PrismaTempUserMapper.toPrisma(user),
    });

    return user;
  }
}
