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

describe('[PUT] /users/:id (E2E)', () => {
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

  afterAll(async () => {
    await app.close();
  });

  it("should allow admin to update a user's information", async () => {
    const company = await companyFactory.makePrismaCompany();

    const admin = await userFactory.makePrismaUser({
      companyId: company.id,
      name: 'Admin',
      role: UserRole.ADMIN,
    });

    const employee = await userFactory.makePrismaUser({
      companyId: company.id,
      name: 'Employee',
      role: UserRole.EMPLOYEE,
      email: 'employee@example.com',
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: admin.id.toString(),
      role: UserRole.ADMIN,
    });

    const response = await request(app.getHttpServer())
      .put(`/users/${employee.id.toString()}`)
      .set('Cookie', `token=${accessToken}`)
      .send({
        name: 'Updated Employee',
        role: UserRole.EMPLOYEE,
        active: true,
      });

    expect(response.statusCode).toBe(204);

    const updatedUser = await prisma.user.findUnique({
      where: { id: employee.id.toString() },
    });

    expect(updatedUser?.name).toBe('Updated Employee');
    expect(updatedUser?.role).toBe(UserRole.EMPLOYEE);
    expect(updatedUser?.active).toBe(true);
  });
});
