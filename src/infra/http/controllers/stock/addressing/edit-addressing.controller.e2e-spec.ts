import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AddressingFactory } from 'test/factories/make-addressing';
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

describe('[PUT] /addressings/:id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let locationFactory: LocationFactory;
  let positionFactory: PositionFactory;
  let rowFactory: RowFactory;
  let shelfFactory: ShelfFactory;
  let subLocationFactory: SubLocationFactory;
  let addressingFactory: AddressingFactory;
  let groupFactory: GroupFactory;
  let materialFactory: MaterialFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        CompanyFactory,
        UserFactory,
        GroupFactory,
        MaterialFactory,
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

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    locationFactory = moduleRef.get(LocationFactory);
    positionFactory = moduleRef.get(PositionFactory);
    rowFactory = moduleRef.get(RowFactory);
    shelfFactory = moduleRef.get(ShelfFactory);
    subLocationFactory = moduleRef.get(SubLocationFactory);
    groupFactory = moduleRef.get(GroupFactory);
    addressingFactory = moduleRef.get(AddressingFactory);
    materialFactory = moduleRef.get(MaterialFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should edit an addressing when user is admin or manager', async () => {
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

    const row = await rowFactory.makePrismaRow({
      companyId: company.id,
    });

    const shelf = await shelfFactory.makePrismaShelf({
      companyId: company.id,
    });

    const position = await positionFactory.makePrismaPosition({
      companyId: company.id,
    });

    const addressing = await addressingFactory.makePrismaAddressing({
      companyId: company.id,
      locationId: location.id,
      subLocationId: subLocation.id,
      rowId: row.id,
      shelfId: shelf.id,
      positionId: position.id,
    });

    const group = await groupFactory.makePrismaGroup({
      companyId: company.id,
    });

    const newMaterial = await materialFactory.makePrismaMaterial({
      companyId: company.id,
      groupId: group.id,
    });

    const response = await request(app.getHttpServer())
      .put(`/addressings/${addressing.id.toString()}`)
      .set('Cookie', `token=${accessToken}`)
      .send({
        active: false,
        materialId: newMaterial.id.toString(),
      });

    expect(response.statusCode).toBe(204);

    const addressingOnDatabase = await prisma.addressing.findUnique({
      where: {
        id: addressing.id.toString(),
      },
    });

    expect(addressingOnDatabase).toBeTruthy();
    expect(addressingOnDatabase?.active).toEqual(false);
    expect(addressingOnDatabase?.materialId).toEqual(newMaterial.id.toString());
  });
});
