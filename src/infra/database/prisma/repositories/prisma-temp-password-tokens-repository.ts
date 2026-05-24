import { Injectable } from '@nestjs/common';

import { TempPasswordTokensRepository } from '@/domain/user/application/repositories/temp-password-tokens-repository';
import { TempPasswordToken } from '@/domain/user/enterprise/entities/temp-password-token';

import { PrismaTempPasswordTokensMapper } from '../mappers/prisma-temp-password-tokens-mapper';
import { PrismaService } from '../prisma.service';
@Injectable()
export class PrismaTempPasswordTokensRepository implements TempPasswordTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: TempPasswordToken): Promise<void> {
    const prismaPasswordToken = PrismaTempPasswordTokensMapper.toPrisma(data);
    await this.prisma.tempPasswordToken.create({ data: prismaPasswordToken });
  }

  async findByToken(token: string): Promise<TempPasswordToken | null> {
    const prismaPasswordToken = await this.prisma.tempPasswordToken.findUnique({
      where: { token },
    });

    if (!prismaPasswordToken) {
      return null;
    }

    return PrismaTempPasswordTokensMapper.toDomain(prismaPasswordToken);
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.tempPasswordToken.delete({ where: { token } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.tempPasswordToken.deleteMany({ where: { userId } });
  }
}
