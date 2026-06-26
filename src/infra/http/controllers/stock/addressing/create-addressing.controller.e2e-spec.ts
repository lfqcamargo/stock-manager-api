import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { GroupFactory } from 'test/factories/make-group';
import { LocationFactory } from 'test/factories/make-location';
import { MaterialFactory } from 'test/factories/make-material';
import { PositionFactory } from 'test/factories/make-position';
import { RowFactory } from 'test/factories/make-row';
import { ShelfFactory } from 'test/factories/make-shelf';
import { SubLocationFactory } from 'test/factories/make-sub-location';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[POST] /addressings (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let locationFactory: LocationFactory;
  let subLocationFactory: SubLocationFactory;
  let rowFactory: RowFactory;
  let shelfFactory: ShelfFactory;
  let positionFactory: PositionFactory;
  let groupFactory: GroupFactory;
  let materialFactory: MaterialFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        CompanyFactory,
        LocationFactory,
        SubLocationFactory,
        RowFactory,
        ShelfFactory,
        PositionFactory,
        GroupFactory,
        MaterialFactory,
        UserFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    locationFactory = moduleRef.get(LocationFactory);
    subLocationFactory = moduleRef.get(SubLocationFactory);
    rowFactory = moduleRef.get(RowFactory);
    groupFactory = moduleRef.get(GroupFactory);
    shelfFactory = moduleRef.get(ShelfFactory);
    positionFactory = moduleRef.get(PositionFactory);
    materialFactory = moduleRef.get(MaterialFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create an addressing when user is admin or manager', async () => {
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
    const subLocation = await subLocationFactory.makePrismaSubLocation({
      companyId: company.id,
      locationId: location.id,
    });
    const row = await rowFactory.makePrismaRow({ companyId: company.id });
    const shelf = await shelfFactory.makePrismaShelf({ companyId: company.id });
    const position = await positionFactory.makePrismaPosition({
      companyId: company.id,
    });

    const group = await groupFactory.makePrismaGroup({
      companyId: company.id,
    });
    const material = await materialFactory.makePrismaMaterial({
      companyId: company.id,
      groupId: group.id,
    });

    const addressingData = {
      locationId: location.id.toString(),
      subLocationId: subLocation.id.toString(),
      rowId: row.id.toString(),
      shelfId: shelf.id.toString(),
      positionId: position.id.toString(),
      materialId: material.id.toString(),
      active: true,
    };

    const response = await request(app.getHttpServer())
      .post('/addressings')
      .set('Cookie', `token=${accessToken}`)
      .send(addressingData);

    expect(response.statusCode).toBe(201);

    const addressing = await prisma.addressing.findFirst();

    expect(addressing).toBeTruthy();
    expect(addressing).toMatchObject({
      locationId: addressingData.locationId,
      subLocationId: addressingData.subLocationId,
      rowId: addressingData.rowId,
      shelfId: addressingData.shelfId,
      positionId: addressingData.positionId,
      materialId: addressingData.materialId,
      active: addressingData.active,
    });
  });
});
