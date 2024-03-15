import { NestFactory, Reflector } from '@nestjs/core';
import { ApiModule } from './api.module';
import config from './config/configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ApiKeyGuard } from './utils/guards/api-key/api-key.guard';

export function initSwagger(app: INestApplication) {
  if (config().SWAGGER_ENABLED) {
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
}

function initGlobalGuard(app: INestApplication) {
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new ApiKeyGuard(reflector));
}
async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  initGlobalGuard(app);
  initSwagger(app);
  await app.listen(3000);
}
bootstrap();
