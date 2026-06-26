import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { LocationFactory } from 'test/factories/make-location';
import { SubLocationFactory } from 'test/factories/make-sub-location';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('[GET] /sub-locations (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let locationFactory: LocationFactory;
  let subLocationFactory: SubLocationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        CompanyFactory,
        UserFactory,
        LocationFactory,
        SubLocationFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);
    locationFactory = moduleRef.get(LocationFactory);
    subLocationFactory = moduleRef.get(SubLocationFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate sub-locations and return correct meta data', async () => {
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

    const totalSubLocations = 25;
    const itemsPerPage = 10;
    const page = 2;

    const location = await locationFactory.makePrismaLocation({
      companyId: company.id,
    });

    for (let i = 0; i < totalSubLocations; i++) {
      await subLocationFactory.makePrismaSubLocation({
        companyId: company.id,
        locationId: location.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/sub-locations?page=${page}&itemsPerPage=${itemsPerPage}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    const { subLocations, meta } = response.body;

    expect(Array.isArray(subLocations)).toBe(true);
    expect(subLocations.length).toBe(itemsPerPage);

    expect(meta.totalItems).toBe(totalSubLocations);
    expect(meta.itemsPerPage).toBe(itemsPerPage);
    expect(meta.currentPage).toBe(page);
    expect(meta.totalPages).toBe(Math.ceil(totalSubLocations / itemsPerPage));
    expect(meta.itemCount).toBe(itemsPerPage);
  });
});
