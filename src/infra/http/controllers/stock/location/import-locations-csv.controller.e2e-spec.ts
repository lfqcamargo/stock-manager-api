import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[POST] /csv/locations (E2E)', () => {
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

  it('should import locations with ADD_NEW mode', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const csv =
      'code,name,description\nA01,Warehouse A,Main warehouse\nB01,Warehouse B,';

    const response = await request(app.getHttpServer())
      .post('/csv/locations?mode=ADD_NEW')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csv), 'locations.csv');

    expect(response.statusCode).toBe(200);
    expect(response.body.imported).toBe(2);

    const locs = await prisma.location.findMany({
      where: { companyId: company.id.toString() },
    });
    expect(locs).toHaveLength(2);
  });

  it('should update existing locations in UPDATE_EXISTING mode', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.MANAGER,
    });

    await prisma.location.create({
      data: {
        id: randomUUID(),
        companyId: company.id.toString(),
        code: 'A01',
        name: 'Old Name',
      },
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.MANAGER,
    });

    const csv = 'code,name\nA01,New Name';

    const response = await request(app.getHttpServer())
      .post('/csv/locations?mode=UPDATE_EXISTING')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csv), 'locations.csv');

    expect(response.statusCode).toBe(200);
    const loc = await prisma.location.findFirst({
      where: { companyId: company.id.toString(), code: 'A01' },
    });
    expect(loc?.name).toBe('New Name');
  });

  it('should delete all and reimport in RESET mode', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    await prisma.location.create({
      data: {
        id: randomUUID(),
        companyId: company.id.toString(),
        code: 'OLD',
        name: 'Old',
      },
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const csv = 'code,name\nNEW,New Loc';

    const response = await request(app.getHttpServer())
      .post('/csv/locations?mode=RESET')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csv), 'locations.csv');

    expect(response.statusCode).toBe(200);
    const locs = await prisma.location.findMany({
      where: { companyId: company.id.toString() },
    });
    expect(locs).toHaveLength(1);
    expect(locs[0].code).toBe('NEW');
  });

  it('should return 403 when user is EMPLOYEE', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.EMPLOYEE,
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.EMPLOYEE,
    });

    const response = await request(app.getHttpServer())
      .post('/csv/locations?mode=ADD_NEW')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from('code,name\nA01,Test'), 'locations.csv');

    expect(response.statusCode).toBe(403);
  });
});
