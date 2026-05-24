import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { CompanyFactory } from 'test/factories/make-company';
import { UserFactory } from 'test/factories/make-user';
import { beforeEach } from 'vitest';

import { DomainEvents } from '@/core/events/domain-events';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

function cookieHeaderFromSetCookie(
  setCookie: string | string[] | undefined,
): string {
  if (!setCookie) {
    return '';
  }
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts.map((c) => c.split(';')[0]).join('; ');
}

describe('Refresh session (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);
    jwtService = moduleRef.get(JwtService);

    await app.init();
  });

  beforeEach(() => {
    DomainEvents.shouldRun = true;
  });

  test('[POST] /auth/session/refresh', async () => {
    const company = await companyFactory.makePrismaCompany();
    const user = await userFactory.makePrismaUser({
      email: 'auth@company.com',
      companyId: company.id,
    });
    const accessToken = jwtService.sign({
      userId: user.id.toString(),
    });
    const refreshToken = jwtService.sign({
      userId: user.id.toString(),
      typ: 'refresh',
    });

    const refresh = await request(app.getHttpServer())
      .post('/auth/session/refresh')
      .set('Cookie', `token=${accessToken}`)
      .set('Cookie', `refresh_token=${refreshToken}`);

    expect(refresh.body).toEqual({ message: 'Tokens refreshed' });

    const newCookieHeader = cookieHeaderFromSetCookie(
      refresh.headers['set-cookie'],
    );
    const newAccess = newCookieHeader
      .split('; ')
      .find((p) => p.startsWith('token='))!
      .slice('token='.length);

    const decoded = jwtService.decode(newAccess);
    expect(decoded.userId).toBe(user.id.toString());
    expect(decoded.exp).toBeDefined();
  });
});
