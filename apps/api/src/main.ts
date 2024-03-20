import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiModule } from './api.module';
import { INestApplication } from '@nestjs/common';
import { ApiKeyGuard } from './utils/guards/api-key/api-key.guard';

import { NestFactory, Reflector } from '@nestjs/core';
import config from './config/configuration';

export function initSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tilda')
    .addSecurity('ApiKey', {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
}

function initGlobalGuard(app: INestApplication) {
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new ApiKeyGuard(reflector));
}
async function bootstrap() {
  const configuration = config();
  const app = await NestFactory.create(ApiModule);
  initGlobalGuard(app);
  initSwagger(app);
  if (configuration.SWAGGER_ENABLED) initSwagger(app);
  app.enableCors(configuration.CORS_CONFIG);
  await app.listen(3000);
}
bootstrap();
