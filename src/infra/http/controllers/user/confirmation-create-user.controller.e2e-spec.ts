import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { TempUserFactory } from 'test/factories/make-temp-user';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('Confirmation Create User (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let tempUserFactory: TempUserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, TempUserFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    tempUserFactory = moduleRef.get(TempUserFactory);

    await app.init();
  });

  test('[POST] /users/confirmation/:token', async () => {
    const companyNew = await companyFactory.makePrismaCompany();
    const tempUser = await tempUserFactory.makePrismaTempUser({
      companyId: companyNew.id,
    });

    const response = await request(app.getHttpServer())
      .post(`/users/confirmation/${tempUser.token}`)
      .send();

    expect(response.statusCode).toBe(201);
    expect(response.body.email).toBe(tempUser.email);

    const user = await prisma.user.findUnique({
      where: {
        email: tempUser.email,
      },
    });

    expect(user).toBeTruthy();
    expect(user?.name).toBe(tempUser.name);
    expect(user?.email).toBe(tempUser.email);
    expect(user?.role).toBe(tempUser.userRole);
    expect(user?.companyId).toBe(tempUser.companyId.toString());
  });
});
