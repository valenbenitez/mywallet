import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export const OPENAPI_TAGS = [
  'Auth',
  'Users',
  'Wallets',
  'Transfers',
  'Transactions',
  'Webhooks',
  'Ops',
] as const;

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Beni Wallet API')
    .setDescription(
      'My Wallet — Circle Developer-Controlled Wallets (custodial MVP).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from POST /auth/login or /auth/signup',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Ops-Token',
        in: 'header',
        description: 'Shared ops token for Circle wallet-set admin endpoints',
      },
      'ops-token',
    )
    .addTag('Auth', 'Signup, login, logout, and current session')
    .addTag('Users', 'Authenticated user profile')
    .addTag('Wallets', 'Wallet list, detail, and balances')
    .addTag('Transfers', 'Fee estimate and USDC transfers')
    .addTag('Transactions', 'Transfer history')
    .addTag('Webhooks', 'Circle webhook ingestion (no JWT)')
    .addTag('Ops', 'Ops-only Circle wallet-set management')
    .build();

  return SwaggerModule.createDocument(app, config);
}

/**
 * Mounts Scalar UI at `/docs` and the raw OpenAPI JSON at `/openapi.json`.
 * Call after ValidationPipe / other global middleware setup.
 */
export function setupOpenApi(app: INestApplication): OpenAPIObject {
  const document = buildOpenApiDocument(app);

  app.use('/openapi.json', (_req: unknown, res: { json: (body: unknown) => void }) => {
    res.json(document);
  });

  app.use(
    '/docs',
    apiReference({
      content: document,
      pageTitle: 'Beni Wallet API',
    }),
  );

  return document;
}
