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
import { WalletsController } from './wallets.controller.js';
import { WalletsService } from './wallets.service.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const WALLET_ID = '22222222-2222-4222-8222-222222222222';

describe('WalletsController (HTTP contract)', () => {
  let app: INestApplication;
  const walletsService = {
    listForUser: vi.fn(),
    getForUser: vi.fn(),
    getBalancesForUser: vi.fn(),
  };
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'wallets-controller-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'wallets-controller-test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [WalletsController],
      providers: [
        { provide: WalletsService, useValue: walletsService },
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
      'wallets-controller-test-secret',
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

  it('GET /wallets returns 401 without Bearer token', async () => {
    await request(app.getHttpServer())
      .get('/wallets')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /wallets returns 200 wallets list shape', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    walletsService.listForUser.mockResolvedValue({
      wallets: [
        {
          id: 'w1',
          circleWalletId: 'c1',
          address: '0xmatic',
          blockchain: 'MATIC-AMOY',
          accountType: 'EOA',
          state: 'LIVE',
          createdAt,
        },
        {
          id: 'w2',
          circleWalletId: 'c2',
          address: '0xeth',
          blockchain: 'ETH-SEPOLIA',
          accountType: 'EOA',
          state: 'LIVE',
          createdAt,
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/wallets')
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(walletsService.listForUser).toHaveBeenCalledWith(USER_ID);
    expect(res.body.wallets).toHaveLength(2);
    expect(res.body.wallets[0]).toEqual(
      expect.objectContaining({
        id: 'w1',
        circleWalletId: 'c1',
        address: '0xmatic',
        blockchain: 'MATIC-AMOY',
        accountType: 'EOA',
        state: 'LIVE',
      }),
    );
  });

  it('GET /wallets/:id returns 200 detail', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    walletsService.getForUser.mockResolvedValue({
      id: WALLET_ID,
      circleWalletId: 'c1',
      address: '0xabc',
      blockchain: 'MATIC-AMOY',
      accountType: 'EOA',
      state: 'LIVE',
      createdAt,
    });

    const res = await request(app.getHttpServer())
      .get(`/wallets/${WALLET_ID}`)
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(walletsService.getForUser).toHaveBeenCalledWith(USER_ID, WALLET_ID);
    expect(res.body.id).toBe(WALLET_ID);
    expect(res.body.circleWalletId).toBe('c1');
  });

  it('GET /wallets/:id/balances returns 200 with string amounts', async () => {
    walletsService.getBalancesForUser.mockResolvedValue({
      balances: [
        { tokenId: 'tok', tokenSymbol: 'USDC', amount: '10.00' },
      ],
    });

    const res = await request(app.getHttpServer())
      .get(`/wallets/${WALLET_ID}/balances`)
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(walletsService.getBalancesForUser).toHaveBeenCalledWith(
      USER_ID,
      WALLET_ID,
    );
    expect(res.body.balances[0].amount).toBe('10.00');
    expect(typeof res.body.balances[0].amount).toBe('string');
  });

  it('rejects public wallet mutations (POST/PATCH/DELETE)', async () => {
    const auth = await authHeader();

    await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', auth)
      .send({})
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .patch(`/wallets/${WALLET_ID}`)
      .set('Authorization', auth)
      .send({ state: 'FROZEN' })
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .delete(`/wallets/${WALLET_ID}`)
      .set('Authorization', auth)
      .expect(HttpStatus.NOT_FOUND);
  });
});
