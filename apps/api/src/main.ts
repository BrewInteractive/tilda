import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import config from './config/configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function initSwagger(app: INestApplication) {
  if (config().SWAGGER_ENABLED) {
    const swaggerConfig = new DocumentBuilder().setTitle('Tilda').build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  initSwagger(app);
  await app.listen(3000);
}
bootstrap();
