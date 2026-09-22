import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupOpenApi } from './openapi/setup-openapi.js';

async function bootstrap() {
  // rawBody required for Circle webhook ECDSA verification over the exact bytes.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // Browser FE (Next on localhost:3000) calls this API cross-origin — enable CORS.
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      ...(process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
        : []),
    ],
    credentials: true,
  });
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
