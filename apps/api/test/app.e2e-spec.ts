import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from './../src/api.module';
import { initSwagger } from '../src/main';

jest.mock('../src/config/configuration', () => ({
  __esModule: true,
  default: jest.fn(() => ({ SWAGGER_ENABLED: true })),
}));

describe('ApiController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    initSwagger(app);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should have Swagger documentation', async () => {
    const response = await request(app.getHttpServer()).get('/docs');
    expect(response.status).toBe(200);
  });
});
