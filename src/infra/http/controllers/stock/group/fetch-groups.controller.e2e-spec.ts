import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { GroupFactory } from 'test/factories/make-group';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

describe('[GET] /groups (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let groupFactory: GroupFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory, GroupFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    prisma = moduleRef.get(PrismaService);
    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);
    groupFactory = moduleRef.get(GroupFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should paginate groups and return correct meta data', async () => {
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

    const totalGroups = 25;
    const itemsPerPage = 10;
    const page = 2;
    const materialPerGroup = 2;
    let active = false;

    for (let i = 0; i < totalGroups; i++) {
      active = !active;

      const group = await groupFactory.makePrismaGroup({
        companyId: company.id,
        active,
      });

      for (let c = 0; c < materialPerGroup; c++) {
        await prisma.material.create({
          data: {
            code: `CODE${i}-${c}`,
            name: `Material ${i}-${c}`,
            description: '',
            unit: 'UN',
            companyId: company.id.toString(),
            groupId: group.id.toString(),
            active: true,
          },
        });
      }
    }

    const response = await request(app.getHttpServer())
      .get(`/groups?page=${page}&itemsPerPage=${itemsPerPage}`)
      .set('Cookie', `token=${accessToken}`);

    expect(response.statusCode).toBe(200);

    const { groups, meta } = response.body;

    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBe(itemsPerPage);

    expect(meta.totalItems).toBe(totalGroups);
    expect(meta.itemsPerPage).toBe(itemsPerPage);
    expect(meta.currentPage).toBe(page);
    expect(meta.totalPages).toBe(Math.ceil(totalGroups / itemsPerPage));
    expect(meta.itemCount).toBe(itemsPerPage);
    expect(meta.totalActiveGroups).toBe(Math.ceil(totalGroups / 2));
    expect(meta.totalEmptyGroups).toBe(0);
  });
});
