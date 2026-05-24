import { Injectable } from '@nestjs/common';

import { DomainEvents } from '@/core/events/domain-events';
import { UsersRepository } from '@/domain/user/application/repositories/users-repository';
import { User } from '@/domain/user/enterprise/entities/user';

import { PrismaUserMapper } from '../mappers/prisma-user-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this._prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    });

    DomainEvents.dispatchEventsForAggregate(user.id);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this._prisma.user.findUnique({
      where: { email },
    });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this._prisma.user.findUnique({
      where: { id },
    });
    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async update(user: User): Promise<void> {
    await this._prisma.user.update({
      where: { id: user.id.toString() },
      data: PrismaUserMapper.toPrisma(user),
    });
  }
}
