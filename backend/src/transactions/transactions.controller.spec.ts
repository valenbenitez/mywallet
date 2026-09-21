import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { JwtStrategy } from '../auth/jwt.strategy.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionsController } from './transactions.controller.js';
import { TransactionsService } from './transactions.service.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const TX_ID = '44444444-4444-4444-8444-444444444444';
const WALLET_ID = '22222222-2222-4222-8222-222222222222';

describe('TransactionsController (HTTP contract)', () => {
  let app: INestApplication;
  const transactionsService = {
    listForUser: vi.fn(),
    getForUser: vi.fn(),
  };
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'transactions-controller-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'transactions-controller-test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: transactionsService },
        { provide: PrismaService, useValue: prisma },
        JwtStrategy,
        JwtAuthGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function authHeader(): Promise<string> {
    const { sign } = await import('jsonwebtoken');
    const token = sign(
      { sub: USER_ID, email: 'a@b.com' },
      'transactions-controller-test-secret',
    );
    prisma.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      passwordHash: 'x',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return `Bearer ${token}`;
  }

  it('GET /transactions returns 401 without Bearer token', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /transactions returns 200 { items, nextCursor } and passes filters', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    transactionsService.listForUser.mockResolvedValue({
      items: [
        {
          id: TX_ID,
          walletId: WALLET_ID,
          direction: 'OUTBOUND',
          blockchain: 'MATIC-AMOY',
          tokenSymbol: 'USDC',
          amount: '10.00',
          sourceAddress: '0xsrc',
          destinationAddress: '0xdst',
          state: 'COMPLETE',
          txHash: '0xhash',
          networkFee: '0.001',
          createdAt,
        },
      ],
      nextCursor: null,
    });

    const res = await request(app.getHttpServer())
      .get('/transactions')
      .query({
        walletId: WALLET_ID,
        direction: 'OUTBOUND',
        state: 'COMPLETE',
        limit: 10,
      })
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(transactionsService.listForUser).toHaveBeenCalledWith(USER_ID, {
      walletId: WALLET_ID,
      direction: 'OUTBOUND',
      state: 'COMPLETE',
      limit: 10,
      cursor: undefined,
    });
    expect(res.body).toEqual({
      items: [
        expect.objectContaining({
          id: TX_ID,
          walletId: WALLET_ID,
          direction: 'OUTBOUND',
          amount: '10.00',
          state: 'COMPLETE',
        }),
      ],
      nextCursor: null,
    });
  });

  it('GET /transactions defaults limit to 20', async () => {
    transactionsService.listForUser.mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(transactionsService.listForUser).toHaveBeenCalledWith(USER_ID, {
      walletId: undefined,
      direction: undefined,
      state: undefined,
      limit: 20,
      cursor: undefined,
    });
  });

  it('GET /transactions rejects invalid direction', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .query({ direction: 'SIDEWAYS' })
      .set('Authorization', await authHeader())
      .expect(HttpStatus.BAD_REQUEST);
    expect(transactionsService.listForUser).not.toHaveBeenCalled();
  });

  it('GET /transactions/:id returns 200 detail', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    transactionsService.getForUser.mockResolvedValue({
      id: TX_ID,
      walletId: WALLET_ID,
      direction: 'INBOUND',
      blockchain: 'ETH-SEPOLIA',
      tokenSymbol: 'USDC',
      amount: '5.00',
      sourceAddress: '0xext',
      destinationAddress: '0xmine',
      state: 'COMPLETE',
      txHash: '0xabc',
      networkFee: null,
      createdAt,
    });

    const res = await request(app.getHttpServer())
      .get(`/transactions/${TX_ID}`)
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(transactionsService.getForUser).toHaveBeenCalledWith(USER_ID, TX_ID);
    expect(res.body.id).toBe(TX_ID);
    expect(res.body.direction).toBe('INBOUND');
  });

  it('rejects PATCH/DELETE on transactions', async () => {
    const auth = await authHeader();

    await request(app.getHttpServer())
      .patch(`/transactions/${TX_ID}`)
      .set('Authorization', auth)
      .send({ state: 'COMPLETE' })
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .delete(`/transactions/${TX_ID}`)
      .set('Authorization', auth)
      .expect(HttpStatus.NOT_FOUND);
  });
});
