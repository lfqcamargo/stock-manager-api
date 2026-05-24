import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { compare } from 'bcryptjs';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { makeTempPasswordToken } from 'test/factories/make-temp-password-token';
import { UserFactory } from 'test/factories/make-user';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaTempPasswordTokensMapper } from '@/infra/database/prisma/mappers/prisma-temp-password-tokens-mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('Exchange Password For Token (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);
    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test('[PATCH] /auth/exchange-password-for-token', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
    });

    const tempPasswordToken = makeTempPasswordToken({
      userId: user.id,
      companyId: company.id,
    });

    await prisma.tempPasswordToken.create({
      data: PrismaTempPasswordTokensMapper.toPrisma(tempPasswordToken),
    });

    const response = await request(app.getHttpServer())
      .patch('/auth/exchange-password-for-token')
      .send({
        token: tempPasswordToken.token,
        password: 'new-password-123',
      });

    expect(response.statusCode).toBe(204);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        id: user.id.toString(),
      },
    });

    const isPasswordCorrect = await compare(
      'new-password-123',
      userOnDatabase!.password,
    );

    expect(isPasswordCorrect).toBe(true);

    const tokenOnDatabase = await prisma.tempPasswordToken.findUnique({
      where: {
        token: tempPasswordToken.token,
      },
    });

    expect(tokenOnDatabase).toBeNull();
  });

  test('[PATCH] /auth/exchange-password-for-token (expired token)', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
    });

    const tempPasswordToken = makeTempPasswordToken({
      userId: user.id,
      companyId: company.id,
      expirationDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    });

    await prisma.tempPasswordToken.create({
      data: PrismaTempPasswordTokensMapper.toPrisma(tempPasswordToken),
    });

    const response = await request(app.getHttpServer())
      .patch('/auth/exchange-password-for-token')
      .send({
        token: tempPasswordToken.token,
        password: 'new-password-123',
      });

    expect(response.statusCode).toBe(400);
  });
});
