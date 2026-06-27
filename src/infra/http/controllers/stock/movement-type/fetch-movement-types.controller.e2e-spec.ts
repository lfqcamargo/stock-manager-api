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

describe('[GET] /movement-types (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let movementTypeFactory: MovementTypeFactory;

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
    jwtService = moduleRef.get(JwtService);
    movementTypeFactory = moduleRef.get(MovementTypeFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate movement types and return correct meta data', async () => {
    const company = await companyFactory.makePrismaCompany();

    const admin = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: admin.id.toString(),
      role: UserRole.ADMIN,
    });

    const totalMovementTypes = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalMovementTypes; i++) {
      await movementTypeFactory.makePrismaMovementType({
        companyId: company.id,
        name: `MovementType-${i}-${Date.now()}-${Math.random()}`,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/movement-types?page=${page}&itemsPerPage=${itemsPerPage}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    const { movementTypes, meta } = response.body;

    expect(Array.isArray(movementTypes)).toBe(true);
    expect(movementTypes.length).toBe(itemsPerPage);

    expect(meta.totalItems).toBe(totalMovementTypes);
    expect(meta.itemsPerPage).toBe(itemsPerPage);
    expect(meta.currentPage).toBe(page);
    expect(meta.totalPages).toBe(Math.ceil(totalMovementTypes / itemsPerPage));
    expect(meta.itemCount).toBe(itemsPerPage);
  });
});
