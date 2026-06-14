import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('Create Temp Company (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  test('[POST] /auth/create-temp-company', async () => {
    const companyData = {
      companyCnpj: '11222333000181',
      companyName: 'Empresa Teste',
      userName: 'Usuario Teste',
      userEmail: 'lfqcamargo@gmail.com',
      userPassword: '12345678',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/create-temp-company')
      .send(companyData);

    expect(response.statusCode).toBe(201);
  });
});
