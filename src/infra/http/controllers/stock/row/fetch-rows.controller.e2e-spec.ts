import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { RowFactory } from 'test/factories/make-row';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('[GET] /rows (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let rowFactory: RowFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, RowFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);
    rowFactory = moduleRef.get(RowFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate rows and return correct meta data', async () => {
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

    const totalRows = 25;
    const itemsPerPage = 10;
    const page = 2;

    for (let i = 0; i < totalRows; i++) {
      await rowFactory.makePrismaRow({
        companyId: company.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/rows?page=${page}&itemsPerPage=${itemsPerPage}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    const { rows, meta } = response.body;

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(itemsPerPage);

    expect(meta.totalItems).toBe(totalRows);
    expect(meta.itemsPerPage).toBe(itemsPerPage);
    expect(meta.currentPage).toBe(page);
    expect(meta.totalPages).toBe(Math.ceil(totalRows / itemsPerPage));
    expect(meta.itemCount).toBe(itemsPerPage);
  });
});
