import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { MovementTypeFactory } from 'test/factories/make-movement-type';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('[GET] /movement-types/:id (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let movementTypeFactory: MovementTypeFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, MovementTypeFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    movementTypeFactory = moduleRef.get(MovementTypeFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should find a movement type by id when user is authenticated', async () => {
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

    const movementType = await movementTypeFactory.makePrismaMovementType({
      companyId: company.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/movement-types/${movementType.id.toString()}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: movementType.id.toString(),
      name: movementType.name,
      direction: movementType.direction,
    });
  });

  it('should return 404 when movement type does not exist', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'auth2@company.com',
      password: '12345678A@',
      role: UserRole.ADMIN,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: user.id.toString(),
      role: UserRole.ADMIN,
    });

    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .get(`/movement-types/${nonExistentId}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
