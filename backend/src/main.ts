import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupOpenApi } from './openapi/setup-openapi.js';

async function bootstrap() {
  // rawBody required for Circle webhook ECDSA verification over the exact bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  setupOpenApi(app);
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
