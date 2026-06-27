import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { MovementTypeFactory } from 'test/factories/make-movement-type';
import { UserFactory } from 'test/factories/make-user';

import { MovementDirection } from '@/domain/stock/enterprise/entities/movement-type';
import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[PUT] /movement-types/:id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    movementTypeFactory = moduleRef.get(MovementTypeFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should edit a movement type when user is admin or manager', async () => {
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

    const movementType = await movementTypeFactory.makePrismaMovementType({
      companyId: company.id,
      direction: MovementDirection.IN,
    });

    const response = await request(app.getHttpServer())
      .put(`/movement-types/${movementType.id.toString()}`)
      .set('Cookie', `token=${accessToken}`)
      .send({
        name: 'Entrada Editada',
        direction: MovementDirection.OUT,
      });

    expect(response.statusCode).toBe(200);

    const movementTypeOnDatabase = await prisma.movementType.findUnique({
      where: { id: movementType.id.toString() },
    });

    expect(movementTypeOnDatabase).toBeTruthy();
    expect(movementTypeOnDatabase?.name).toEqual('Entrada Editada');
    expect(movementTypeOnDatabase?.direction).toEqual(MovementDirection.OUT);
  });
});
