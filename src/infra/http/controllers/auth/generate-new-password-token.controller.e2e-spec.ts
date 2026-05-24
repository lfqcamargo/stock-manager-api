import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('Generate New Password Token (E2E)', () => {
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

  test('[POST] /auth/generate-new-password-token', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'user@example.com',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/generate-new-password-token')
      .send({
        email: 'user@example.com',
      });

    expect(response.statusCode).toBe(204);

    const tokenOnDatabase = await prisma.tempPasswordToken.findFirst({
      where: {
        userId: user.id.toString(),
      },
    });

    expect(tokenOnDatabase).toBeTruthy();
  });
});
