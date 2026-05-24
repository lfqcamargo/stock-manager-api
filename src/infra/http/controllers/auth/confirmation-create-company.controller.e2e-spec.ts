import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { TempCompaniesRepository } from '@/domain/user/application/repositories/temp-companies-repository';
import { TempCompany } from '@/domain/user/enterprise/entities/temp-company';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';

describe('Confirmation Create Company (E2E)', () => {
  let app: INestApplication;
  let tempCompaniesRepository: TempCompaniesRepository;
  let tempCompany: TempCompany;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();
    tempCompaniesRepository = moduleRef.get<TempCompaniesRepository>(
      TempCompaniesRepository,
    );

    await app.init();
  });

  afterAll(async () => {
    if (tempCompany) {
      const currentTempCompany = await tempCompaniesRepository.findByToken(
        tempCompany.token,
      );
      if (currentTempCompany) {
        await tempCompaniesRepository.delete(currentTempCompany);
      }
    }

    await app.close();
  });

  test('[POST] /auth/confirmation-create-company', async () => {
    const uniqueSuffix = String(Date.now()).slice(-6);
    const companyCnpj = `12345678${uniqueSuffix}`;
    const userEmail = `lfqcamargo+${uniqueSuffix}@gmail.com`;

    tempCompany = TempCompany.create({
      companyName: 'Teste',
      companyCnpj,
      userName: 'Teste',
      userEmail,
      userPassword: '123456789',
    });

    await tempCompaniesRepository.create(tempCompany);

    const response = await request(app.getHttpServer())
      .post('/auth/confirmation-create-company')
      .send({ token: tempCompany.token });

    expect(response.statusCode).toBe(201);
  });
});
