import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('Logout (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);
    jwtService = moduleRef.get(JwtService);
    await app.init();
  });

  test('[GET] /auth/session/logout', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'lfqcamargo@gmail.com',
      password: await hash('123456789Lfqcamargo@', 8),
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: user.role,
    });

    const refreshToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: user.role,
      typ: 'refresh',
    });

    const response = await request(app.getHttpServer())
      .get('/auth/session/logout')
      .set('Cookie', [`token=${accessToken}`, `refresh_token=${refreshToken}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Logged out',
    });
  });
});
