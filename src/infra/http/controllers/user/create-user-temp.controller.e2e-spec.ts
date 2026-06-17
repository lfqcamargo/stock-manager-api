import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('Create User Temp (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  test('[POST] /users', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'auth@company.com',
      password: '12345678A@',
      role: UserRole.ADMIN,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const userData = {
      email: 'lfqcamargo@gmail.com',
      name: 'Lucas Camargo',
      role: UserRole.ADMIN,
      password: 'Wa12345678A@',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Cookie', `token=${accessToken}`)
      .send(userData);

    expect(response.statusCode).toBe(201);

    const tempUser = await prisma.tempUser.findUnique({
      where: {
        email: userData.email,
      },
    });

    expect(tempUser).toBeDefined();
    expect(tempUser?.email).toBe(userData.email);
    expect(tempUser?.name).toBe(userData.name);
    expect(tempUser?.token).toBeDefined();
    expect(tempUser?.expirationDate).toBeDefined();
  });
});
