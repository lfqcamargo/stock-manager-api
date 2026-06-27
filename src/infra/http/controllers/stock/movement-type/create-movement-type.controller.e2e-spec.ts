import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[POST] /movement-types (E2E)', () => {
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

  it('should create a movement type when user is admin or manager', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'admin@company.com',
      password: '12345678A@',
      role: UserRole.ADMIN,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const movementTypeData = {
      name: 'Entrada de Estoque',
      direction: MovementDirection.IN,
    };

    const response = await request(app.getHttpServer())
      .post('/movement-types')
      .set('Cookie', `token=${accessToken}`)
      .send(movementTypeData);

    expect(response.statusCode).toBe(201);

    const movementType = await prisma.movementType.findFirst({
      where: { companyId: company.id.toString() },
    });

    expect(movementType).toBeTruthy();
    expect(movementType).toMatchObject({
      name: movementTypeData.name,
      direction: movementTypeData.direction,
    });
  });

  it('should return 403 when user has EMPLOYEE role', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'employee@company.com',
      password: '12345678A@',
      role: UserRole.EMPLOYEE,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.EMPLOYEE,
    });

    const response = await request(app.getHttpServer())
      .post('/movement-types')
      .set('Cookie', `token=${accessToken}`)
      .send({
        name: 'Saída de Estoque',
        direction: MovementDirection.OUT,
      });

    expect(response.statusCode).toBe(403);
  });
});
