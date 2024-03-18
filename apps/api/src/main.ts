import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiModule } from './api.module';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import config from './config/configuration';

export function initSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder().setTitle('Tilda').build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
  const configuration = config();
  const app = await NestFactory.create(ApiModule);
  if (configuration.SWAGGER_ENABLED) initSwagger(app);
  app.enableCors(configuration.CORS_CONFIG);
  await app.listen(3000);
}
bootstrap();
