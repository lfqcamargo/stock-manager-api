import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { TempUsersRepository } from '@/domain/user/application/repositories/temp-users-repository';
import { TempUser } from '@/domain/user/enterprise/entities/temp-user';

import { PrismaTempUserMapper } from '../mappers/prisma-temp-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTempUsersRepository implements TempUsersRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(tempuser: TempUser): Promise<void> {
    await this._prisma.tempUser.create({
      data: PrismaTempUserMapper.toPrisma(tempuser),
    });

    DomainEvents.dispatchEventsForAggregate(tempuser.id);
  }

  async findByEmail(email: string): Promise<TempUser | null> {
    const tempuser = await this._prisma.tempUser.findUnique({
      where: { email },
    });
    return tempuser ? PrismaTempUserMapper.toDomain(tempuser) : null;
  }

  async findByToken(token: string): Promise<TempUser | null> {
    const tempuser = await this._prisma.tempUser.findUnique({
      where: { token },
    });
    return tempuser ? PrismaTempUserMapper.toDomain(tempuser) : null;
  }

  async delete(tempuser: TempUser): Promise<void> {
    await this._prisma.tempUser.delete({
      where: { id: tempuser.id.toString() },
    });
  }
}
