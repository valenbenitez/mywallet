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
import { TransfersController } from './transfers.controller.js';
import { TransfersService } from './transfers.service.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const WALLET_ID = '22222222-2222-4222-8222-222222222222';
const DEST = '0x1111111111111111111111111111111111111111';

describe('TransfersController (HTTP contract)', () => {
  let app: INestApplication;
  const transfersService = {
    estimateFee: vi.fn(),
    createTransfer: vi.fn(),
  };
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'transfers-controller-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'transfers-controller-test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [TransfersController],
      providers: [
        { provide: TransfersService, useValue: transfersService },
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
      'transfers-controller-test-secret',
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

  it('POST estimate-fee returns 401 without Bearer token', async () => {
    await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers/estimate-fee`)
      .send({
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST estimate-fee returns 200 fee levels', async () => {
    transfersService.estimateFee.mockResolvedValue({
      low: { networkFee: '0.001', gasLimit: '21000' },
      medium: { networkFee: '0.002', gasLimit: '21000' },
      high: { networkFee: '0.003', gasLimit: '21000' },
    });

    const res = await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers/estimate-fee`)
      .set('Authorization', await authHeader())
      .send({
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
      })
      .expect(HttpStatus.OK);

    expect(transfersService.estimateFee).toHaveBeenCalledWith(
      USER_ID,
      WALLET_ID,
      expect.objectContaining({
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
      }),
    );
    expect(res.body.medium.networkFee).toBe('0.002');
    expect(typeof res.body.medium.networkFee).toBe('string');
  });

  it('POST estimate-fee rejects invalid EVM address', async () => {
    await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers/estimate-fee`)
      .set('Authorization', await authHeader())
      .send({
        destinationAddress: 'not-an-address',
        amount: '10.00',
        tokenSymbol: 'USDC',
      })
      .expect(HttpStatus.BAD_REQUEST);
    expect(transfersService.estimateFee).not.toHaveBeenCalled();
  });

  it('POST estimate-fee rejects non-USDC tokenSymbol', async () => {
    await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers/estimate-fee`)
      .set('Authorization', await authHeader())
      .send({
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'ETH',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('POST transfers returns 201 transaction shape', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    transfersService.createTransfer.mockResolvedValue({
      transaction: {
        id: 'tx-1',
        walletId: WALLET_ID,
        direction: 'OUTBOUND',
        blockchain: 'MATIC-AMOY',
        tokenSymbol: 'USDC',
        amount: '10.00',
        sourceAddress: '0xabc',
        destinationAddress: DEST,
        state: 'INITIATED',
        txHash: null,
        networkFee: null,
        createdAt,
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers`)
      .set('Authorization', await authHeader())
      .send({
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
        feeLevel: 'MEDIUM',
        idempotencyKey: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      })
      .expect(HttpStatus.CREATED);

    expect(transfersService.createTransfer).toHaveBeenCalledWith(
      USER_ID,
      WALLET_ID,
      expect.objectContaining({
        feeLevel: 'MEDIUM',
        amount: '10.00',
      }),
    );
    expect(res.body.transaction).toEqual(
      expect.objectContaining({
        id: 'tx-1',
        direction: 'OUTBOUND',
        state: 'INITIATED',
        amount: '10.00',
        tokenSymbol: 'USDC',
      }),
    );
  });

  it('POST transfers rejects invalid feeLevel', async () => {
    await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers`)
      .set('Authorization', await authHeader())
      .send({
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
        feeLevel: 'ULTRA',
      })
      .expect(HttpStatus.BAD_REQUEST);
    expect(transfersService.createTransfer).not.toHaveBeenCalled();
  });

  it('POST transfers allows omitted idempotencyKey', async () => {
    transfersService.createTransfer.mockResolvedValue({
      transaction: {
        id: 'tx-2',
        walletId: WALLET_ID,
        direction: 'OUTBOUND',
        blockchain: 'ETH-SEPOLIA',
        tokenSymbol: 'USDC',
        amount: '5.00',
        sourceAddress: '0xabc',
        destinationAddress: DEST,
        state: 'INITIATED',
        txHash: null,
        networkFee: null,
        createdAt: new Date(),
      },
    });

    await request(app.getHttpServer())
      .post(`/wallets/${WALLET_ID}/transfers`)
      .set('Authorization', await authHeader())
      .send({
        destinationAddress: DEST,
        amount: '5.00',
        tokenSymbol: 'USDC',
        feeLevel: 'LOW',
      })
      .expect(HttpStatus.CREATED);

    expect(transfersService.createTransfer).toHaveBeenCalled();
  });
});
