import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { MovementFactory } from 'test/factories/make-movement';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('[GET] /movements (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let movementFactory: MovementFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, MovementFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);
    movementFactory = moduleRef.get(MovementFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate movements and return correct meta data', async () => {
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

    const totalMovements = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalMovements; i++) {
      await movementFactory.makePrismaMovement({
        companyId: company.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/movements?page=${page}&itemsPerPage=${itemsPerPage}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    const { movements, meta } = response.body;

    expect(Array.isArray(movements)).toBe(true);
    expect(movements.length).toBe(itemsPerPage);

    expect(meta.totalItems).toBe(totalMovements);
    expect(meta.itemsPerPage).toBe(itemsPerPage);
    expect(meta.currentPage).toBe(page);
    expect(meta.totalPages).toBe(Math.ceil(totalMovements / itemsPerPage));
    expect(meta.itemCount).toBe(itemsPerPage);
  });
});
