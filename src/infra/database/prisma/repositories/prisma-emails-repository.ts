import { Injectable } from '@nestjs/common';

import { EmailsRepository } from '@/domain/notification/application/repositories/emails-repository';
import { Email } from '@/domain/notification/enterprise/entities/email';

import { PrismaEmailMapper } from '../mappers/prisma-email-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaEmailsRepository implements EmailsRepository {
  constructor(private prisma: PrismaService) {}

  async create(email: Email): Promise<void> {
    const data = PrismaEmailMapper.toPrisma(email);

    await this.prisma.email.create({
      data,
    });
  }
}
