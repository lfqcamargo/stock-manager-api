import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { GroupFactory } from 'test/factories/make-group';
import { MaterialFactory } from 'test/factories/make-material';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[PUT] /materials/:id (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let groupFactory: GroupFactory;
  let materialFactory: MaterialFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, GroupFactory, MaterialFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    groupFactory = moduleRef.get(GroupFactory);
    materialFactory = moduleRef.get(MaterialFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should edit a material when user is admin or manager', async () => {
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

    const group = await groupFactory.makePrismaGroup({ companyId: company.id });
    const material = await materialFactory.makePrismaMaterial({
      groupId: group.id,
      companyId: company.id,
    });

    const response = await request(app.getHttpServer())
      .put(`/materials/${material.id.toString()}`)
      .set('Cookie', `token=${accessToken}`)
      .send({
        code: 'CODE',
        name: 'Material Editado',
        description: 'Description',
        unit: 'KG',
        groupId: group.id.toString(),
        active: true,
      });

    expect(response.statusCode).toBe(204);

    const materialOnDatabase = await prisma.material.findUnique({
      where: {
        id: material.id.toString(),
      },
    });

    expect(materialOnDatabase).toBeTruthy();
    expect(materialOnDatabase?.name).toEqual('Material Editado');
  });
});
