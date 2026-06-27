import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AddressingFactory } from 'test/factories/make-addressing';
import { CompanyFactory } from 'test/factories/make-company';
import { LocationFactory } from 'test/factories/make-location';
import { MovementFactory } from 'test/factories/make-movement';
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

describe('[GET] /movements/:id (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let locationFactory: LocationFactory;
  let subLocationFactory: SubLocationFactory;
  let rowFactory: RowFactory;
  let shelfFactory: ShelfFactory;
  let positionFactory: PositionFactory;
  let addressingFactory: AddressingFactory;
  let movementTypeFactory: MovementTypeFactory;
  let movementFactory: MovementFactory;
  let jwtService: JwtService;

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
        MovementFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    locationFactory = moduleRef.get(LocationFactory);
    subLocationFactory = moduleRef.get(SubLocationFactory);
    rowFactory = moduleRef.get(RowFactory);
    shelfFactory = moduleRef.get(ShelfFactory);
    positionFactory = moduleRef.get(PositionFactory);
    addressingFactory = moduleRef.get(AddressingFactory);
    movementTypeFactory = moduleRef.get(MovementTypeFactory);
    movementFactory = moduleRef.get(MovementFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should find a movement by id when user is authenticated', async () => {
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

    // Build a full addressing chain so FK constraints are satisfied
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

    const movement = await movementFactory.makePrismaMovement({
      companyId: company.id,
      addressingId: addressing.id,
      movementTypeId: movementType.id,
      userId: user.id,
      quantity: 5,
    });

    const response = await request(app.getHttpServer())
      .get(`/movements/${movement.id.toString()}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: movement.id.toString(),
      addressingId: addressing.id.toString(),
      movementTypeId: movementType.id.toString(),
      userId: user.id.toString(),
      quantity: 5,
    });
  });

  it('should return 404 when movement does not exist', async () => {
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
      .get(`/movements/${nonExistentId}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(404);
  });
});
