import { INestApplication, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthController } from '../auth/auth.controller.js';
import { AuthService } from '../auth/auth.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CircleController } from '../circle/circle.controller.js';
import { CircleService } from '../circle/circle.service.js';
import { OpsTokenGuard } from '../circle/ops-token.guard.js';
import { TransactionsController } from '../transactions/transactions.controller.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { TransfersController } from '../transfers/transfers.controller.js';
import { TransfersService } from '../transfers/transfers.service.js';
import { UsersController } from '../users/users.controller.js';
import { UsersService } from '../users/users.service.js';
import { WalletsController } from '../wallets/wallets.controller.js';
import { WalletsService } from '../wallets/wallets.service.js';
import { WebhooksController } from '../webhooks/webhooks.controller.js';
import { WebhooksService } from '../webhooks/webhooks.service.js';
import {
  OPENAPI_TAGS,
  buildOpenApiDocument,
  setupOpenApi,
} from './setup-openapi.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [
    AuthController,
    UsersController,
    WalletsController,
    TransfersController,
    TransactionsController,
    WebhooksController,
    CircleController,
  ],
  providers: [
    { provide: AuthService, useValue: {} },
    { provide: UsersService, useValue: {} },
    { provide: WalletsService, useValue: {} },
    { provide: TransfersService, useValue: {} },
    { provide: TransactionsService, useValue: {} },
    { provide: WebhooksService, useValue: {} },
    { provide: CircleService, useValue: {} },
    JwtAuthGuard,
  ],
})
class OpenApiSmokeModule {}

describe('OpenAPI + Scalar setup', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OpenApiSmokeModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OpsTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    setupOpenApi(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('generates an OpenAPI document with required tags, paths, and security schemes', () => {
    const document = buildOpenApiDocument(app);

    const tagNames = (document.tags ?? []).map((t) => t.name);
    for (const tag of OPENAPI_TAGS) {
      expect(tagNames).toContain(tag);
    }

    expect(document.components?.securitySchemes).toMatchObject({
      bearer: expect.objectContaining({ type: 'http', scheme: 'bearer' }),
      'ops-token': expect.objectContaining({
        type: 'apiKey',
        name: 'X-Ops-Token',
        in: 'header',
      }),
    });

    const paths = document.paths ?? {};
    expect(paths['/auth/signup']).toBeDefined();
    expect(paths['/auth/login']).toBeDefined();
    expect(paths['/users/me']).toBeDefined();
    expect(paths['/wallets']).toBeDefined();
    expect(paths['/wallets/{id}/transfers']).toBeDefined();
    expect(paths['/transactions']).toBeDefined();
    expect(paths['/webhooks/circle']).toBeDefined();
    expect(paths['/ops/wallet-sets']).toBeDefined();

    const webhookPost = paths['/webhooks/circle']?.post;
    expect(webhookPost?.security ?? []).toEqual([]);

    const usersMe = paths['/users/me']?.get;
    expect(usersMe?.security).toEqual([{ bearer: [] }]);

    const opsList = paths['/ops/wallet-sets']?.get;
    expect(opsList?.security).toEqual([{ 'ops-token': [] }]);

    const signupBody =
      paths['/auth/signup']?.post?.requestBody?.content?.['application/json']
        ?.schema;
    expect(signupBody).toBeDefined();
  });

  it('serves /openapi.json with the generated document', async () => {
    const res = await request(app.getHttpServer())
      .get('/openapi.json')
      .expect(200);

    expect(res.body.info?.title).toBe('Beni Wallet API');
    expect(res.body.paths['/auth/login']).toBeDefined();
    expect(res.body.components.securitySchemes.bearer).toBeDefined();
    expect(res.body.components.securitySchemes['ops-token']).toBeDefined();
  });

  it('serves Scalar UI at /docs without requiring a browser', async () => {
    const res = await request(app.getHttpServer()).get('/docs').expect(200);

    expect(res.headers['content-type']).toMatch(/html/i);
    expect(res.text.length).toBeGreaterThan(0);
    expect(res.text.toLowerCase()).toMatch(/scalar|api-reference|openapi/);
  });
});
