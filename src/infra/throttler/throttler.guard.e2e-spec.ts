import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';

import { UserRole } from '@/domain/user/enterprise/entities/user';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('ThrottlerGuard (E2E)', () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let userFactory: UserFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ credentials: true });

    companyFactory = moduleRef.get(CompanyFactory);
    userFactory = moduleRef.get(UserFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 429 after exceeding the rate limit', async () => {
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

    // The 'medium' throttler allows 100 requests per minute (60s TTL).
    // Fire 110 requests in parallel so they all land within the same TTL window,
    // guaranteeing at least 10 are throttled.
    const MEDIUM_LIMIT = 100;
    const TOTAL = MEDIUM_LIMIT + 10;

    const responses = await Promise.all(
      Array.from({ length: TOTAL }, () =>
        request(app.getHttpServer())
          .get('/users')
          .set('Cookie', `token=${accessToken}`)
          .then((res) => res.statusCode),
      ),
    );

    const success = responses.filter((s) => s === 200).length;
    const throttled = responses.filter((s) => s === 429).length;

    expect(success).toBeLessThanOrEqual(MEDIUM_LIMIT);
    expect(throttled).toBeGreaterThan(0);
  });
});
