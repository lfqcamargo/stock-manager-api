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

describe('[GET] /materials (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let groupFactory: GroupFactory;
  let materialFactory: MaterialFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, GroupFactory, MaterialFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);
    groupFactory = moduleRef.get(GroupFactory);
    materialFactory = moduleRef.get(MaterialFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should fetch materials', async () => {
    const company = await companyFactory.makePrismaCompany();

    const admin = await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.ADMIN,
    });

    await userFactory.makePrismaUser({
      companyId: company.id,
      role: UserRole.EMPLOYEE,
    });

    const accessToken = jwtService.sign({
      companyId: company.id.toString(),
      userId: admin.id.toString(),
      role: UserRole.ADMIN,
    });

    const group1 = await groupFactory.makePrismaGroup({
      companyId: company.id,
    });
    const group2 = await groupFactory.makePrismaGroup({
      companyId: company.id,
    });

    for (let c = 1; c <= 10; c++) {
      await materialFactory.makePrismaMaterial({
        companyId: company.id,
        groupId: group1.id,
      });
    }

    for (let c = 1; c <= 12; c++) {
      await materialFactory.makePrismaMaterial({
        companyId: company.id,
        groupId: group2.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/materials?groupId=${group2.id.toString()}&page=2&itemsPerPage=10`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.materials)).toBe(true);
    expect(response.body.materials.length).toBe(2);
    expect(response.body.meta).toEqual({
      totalItems: 12,
      itemCount: 2,
      itemsPerPage: 10,
      totalPages: 2,
      currentPage: 2,
      totalActiveMaterials: expect.any(Number),
    });
  });
});
