import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AddressingFactory } from 'test/factories/make-addressing';
import { CompanyFactory } from 'test/factories/make-company';
import { LocationFactory } from 'test/factories/make-location';
import { PositionFactory } from 'test/factories/make-position';
import { RowFactory } from 'test/factories/make-row';
import { ShelfFactory } from 'test/factories/make-shelf';
import { SubLocationFactory } from 'test/factories/make-sub-location';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('[GET] /addressings (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let locationFactory: LocationFactory;
  let subLocationFactory: SubLocationFactory;
  let rowFactory: RowFactory;
  let shelfFactory: ShelfFactory;
  let positionFactory: PositionFactory;
  let addressingFactory: AddressingFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        CompanyFactory,
        UserFactory,
        LocationFactory,
        PositionFactory,
        RowFactory,
        ShelfFactory,
        SubLocationFactory,
        AddressingFactory,
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
    rowFactory = moduleRef.get(RowFactory);
    shelfFactory = moduleRef.get(ShelfFactory);
    positionFactory = moduleRef.get(PositionFactory);
    addressingFactory = moduleRef.get(AddressingFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate addressings and return correct meta data', async () => {
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

    const totalAddressings = 25;
    const itemsPerPage = 10;
    const page = 2;

    const location = await locationFactory.makePrismaLocation({
      companyId: company.id,
    });

    const subLocation = await subLocationFactory.makePrismaSubLocation({
      companyId: company.id,
      locationId: location.id,
    });

    const row = await rowFactory.makePrismaRow({
      companyId: company.id,
    });

    const shelf = await shelfFactory.makePrismaShelf({
      companyId: company.id,
    });

    const position = await positionFactory.makePrismaPosition({
      companyId: company.id,
    });

    for (let i = 0; i < totalAddressings; i++) {
      await addressingFactory.makePrismaAddressing({
        companyId: company.id,
        locationId: location.id,
        subLocationId: subLocation.id,
        rowId: row.id,
        shelfId: shelf.id,
        positionId: position.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/addressings?page=${page}&itemsPerPage=${itemsPerPage}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    const { addressings, meta } = response.body;

    expect(Array.isArray(addressings)).toBe(true);
    expect(addressings.length).toBe(itemsPerPage);

    expect(meta.totalItems).toBe(totalAddressings);
    expect(meta.itemsPerPage).toBe(itemsPerPage);
    expect(meta.currentPage).toBe(page);
    expect(meta.totalPages).toBe(Math.ceil(totalAddressings / itemsPerPage));
    expect(meta.itemCount).toBe(itemsPerPage);
  });
});
