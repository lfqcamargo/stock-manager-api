import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { LocationFactory } from 'test/factories/make-location';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[POST] /sub-locations (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let locationFactory: LocationFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, LocationFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    locationFactory = moduleRef.get(LocationFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a sub-location when user is admin or manager', async () => {
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

    const location = await locationFactory.makePrismaLocation({
      companyId: company.id,
    });

    const subLocationData = {
      locationId: location.id.toString(),
      code: 'SUB-1',
      name: 'Sub-Localização',
      description: 'Teste',
    };

    const response = await request(app.getHttpServer())
      .post('/sub-locations')
      .set('Cookie', `token=${accessToken}`)
      .send(subLocationData);

    expect(response.statusCode).toBe(201);

    const subLocation = await prisma.subLocation.findFirst();

    expect(subLocation).toBeTruthy();
    expect(subLocation).toMatchObject({
      locationId: subLocationData.locationId,
      code: subLocationData.code,
      name: subLocationData.name,
      description: subLocationData.description,
    });
  });
});
