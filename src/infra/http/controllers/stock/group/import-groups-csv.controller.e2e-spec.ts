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

describe('[POST] /csv/groups (E2E)', () => {
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

  it('should import groups with ADD_NEW mode', async () => {
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

    const csvContent =
      'code,name,description,active\nG001,Group 1,Desc 1,true\nG002,Group 2,,false';

    const response = await request(app.getHttpServer())
      .post('/csv/groups?mode=ADD_NEW')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csvContent), 'groups.csv');

    expect(response.statusCode).toBe(200);
    expect(response.body.imported).toBe(2);
    expect(response.body.skipped).toBe(0);

    const groups = await prisma.group.findMany({
      where: { companyId: company.id.toString() },
    });
    expect(groups).toHaveLength(2);
  });

  it('should skip existing groups in ADD_NEW mode', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    await prisma.group.create({
      data: {
        id: randomUUID(),
        companyId: company.id.toString(),
        code: 'G001',
        name: 'Existing Group',
        active: true,
      },
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const csvContent = 'code,name\nG001,New Name\nG002,New Group';

    const response = await request(app.getHttpServer())
      .post('/csv/groups?mode=ADD_NEW')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csvContent), 'groups.csv');

    expect(response.statusCode).toBe(200);
    expect(response.body.imported).toBe(1);
    expect(response.body.skipped).toBe(1);

    const existing = await prisma.group.findFirst({
      where: { companyId: company.id.toString(), code: 'G001' },
    });
    expect(existing?.name).toBe('Existing Group');
  });

  it('should update existing groups in UPDATE_EXISTING mode', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    await prisma.group.create({
      data: {
        id: randomUUID(),
        companyId: company.id.toString(),
        code: 'G001',
        name: 'Old Name',
        active: true,
      },
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const csvContent = 'code,name,active\nG001,Updated Name,false';

    const response = await request(app.getHttpServer())
      .post('/csv/groups?mode=UPDATE_EXISTING')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csvContent), 'groups.csv');

    expect(response.statusCode).toBe(200);
    expect(response.body.imported).toBe(1);

    const updated = await prisma.group.findFirst({
      where: { companyId: company.id.toString(), code: 'G001' },
    });
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.active).toBe(false);
  });

  it('should delete all and reimport in RESET mode', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    await prisma.group.create({
      data: {
        id: randomUUID(),
        companyId: company.id.toString(),
        code: 'OLD',
        name: 'Old Group',
        active: true,
      },
    });

    const token = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const csvContent = 'code,name\nNEW,New Group';

    const response = await request(app.getHttpServer())
      .post('/csv/groups?mode=RESET')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csvContent), 'groups.csv');

    expect(response.statusCode).toBe(200);

    const groups = await prisma.group.findMany({
      where: { companyId: company.id.toString() },
    });
    expect(groups).toHaveLength(1);
    expect(groups[0].code).toBe('NEW');
  });

  it('should return 400 when no file is provided', async () => {
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

    const response = await request(app.getHttpServer())
      .post('/csv/groups?mode=ADD_NEW')
      .set('Cookie', `token=${token}`);

    expect(response.statusCode).toBe(400);
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

    const csvContent = 'code,name\nG001,Group 1';

    const response = await request(app.getHttpServer())
      .post('/csv/groups?mode=ADD_NEW')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from(csvContent), 'groups.csv');

    expect(response.statusCode).toBe(403);
  });
});
