import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AddressingFactory } from 'test/factories/make-addressing';
import { CompanyFactory } from 'test/factories/make-company';
import { LocationFactory } from 'test/factories/make-location';
import { MovementTypeFactory } from 'test/factories/make-movement-type';
import { PositionFactory } from 'test/factories/make-position';
import { RowFactory } from 'test/factories/make-row';
import { ShelfFactory } from 'test/factories/make-shelf';
import { SubLocationFactory } from 'test/factories/make-sub-location';
import { UserFactory } from 'test/factories/make-user';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[POST] /movements (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let locationFactory: LocationFactory;
  let subLocationFactory: SubLocationFactory;
  let rowFactory: RowFactory;
  let shelfFactory: ShelfFactory;
  let positionFactory: PositionFactory;
  let addressingFactory: AddressingFactory;
  let movementTypeFactory: MovementTypeFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        CompanyFactory,
        UserFactory,
        LocationFactory,
        SubLocationFactory,
        RowFactory,
        ShelfFactory,
        PositionFactory,
        AddressingFactory,
        MovementTypeFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);
    locationFactory = moduleRef.get(LocationFactory);
    subLocationFactory = moduleRef.get(SubLocationFactory);
    rowFactory = moduleRef.get(RowFactory);
    shelfFactory = moduleRef.get(ShelfFactory);
    positionFactory = moduleRef.get(PositionFactory);
    addressingFactory = moduleRef.get(AddressingFactory);
    movementTypeFactory = moduleRef.get(MovementTypeFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create an IN movement and increment addressing balance', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'admin@company.com',
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
      amount: 10,
      active: true,
    });

    const movementType = await movementTypeFactory.makePrismaMovementType({
      companyId: company.id,
      direction: MovementDirection.IN,
    });

    const response = await request(app.getHttpServer())
      .post('/movements')
      .set('Cookie', `token=${accessToken}`)
      .send({
        addressingId: addressing.id.toString(),
        movementTypeId: movementType.id.toString(),
        quantity: 5,
        observation: 'Test entry',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      addressingId: addressing.id.toString(),
      movementTypeId: movementType.id.toString(),
      quantity: 5,
    });

    const updatedAddressing = await prisma.addressing.findUnique({
      where: { id: addressing.id.toString() },
    });

    expect(updatedAddressing?.amount).toBe(15);
  });

  it('should return 409 when balance is insufficient for OUT movement', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      companyId: company.id,
      email: 'admin2@company.com',
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
      amount: 3,
      active: true,
    });

    const movementType = await movementTypeFactory.makePrismaMovementType({
      companyId: company.id,
      direction: MovementDirection.OUT,
    });

    const response = await request(app.getHttpServer())
      .post('/movements')
      .set('Cookie', `token=${accessToken}`)
      .send({
        addressingId: addressing.id.toString(),
        movementTypeId: movementType.id.toString(),
        quantity: 10,
      });

    expect(response.statusCode).toBe(409);
  });
});
