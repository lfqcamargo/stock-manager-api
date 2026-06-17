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

describe('[GET] /users (E2E)', () => {
  let app: INestApplication;
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

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  it("should fetch users from the authenticated user's company", async () => {
    const company = await companyFactory.makePrismaCompany();

    const admin = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.EMPLOYEE,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: admin.id.toString(),
      role: UserRole.ADMIN,
    });

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThanOrEqual(1);
    expect(response.body.users[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      }),
    );

    expect(response.body.meta).toBeDefined();
    expect(typeof response.body.meta.totalItems).toBe('number');
    expect(typeof response.body.meta.itemCount).toBe('number');
    expect(typeof response.body.meta.itemsPerPage).toBe('number');
    expect(typeof response.body.meta.totalPages).toBe('number');
    expect(typeof response.body.meta.currentPage).toBe('number');
    expect(typeof response.body.meta.totalAdmin).toBe('number');
    expect(typeof response.body.meta.totalMaanger).toBe('number');
    expect(typeof response.body.meta.totalEmployee).toBe('number');
    expect(typeof response.body.meta.totalActive).toBe('number');
    expect(typeof response.body.meta.totalInactive).toBe('number');
    expect(new Date(response.body.meta.lastCreated)).toBeInstanceOf(Date);
  });
});
