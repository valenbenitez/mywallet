import {
  BadGatewayException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CircleService } from '../circle/circle.service.js';
import {
  Prisma,
  WalletBlockchain,
  WalletState,
  type User,
  type Wallet,
} from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

function makeUser(overrides: Partial<User> = {}): User {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'ada@example.com',
    passwordHash: '$2b$12$hashed',
    firstName: 'Ada',
    lastName: 'Lovelace',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeWallet(overrides: Partial<Wallet> = {}): Wallet {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: '22222222-2222-2222-2222-222222222222',
    userId: '11111111-1111-1111-1111-111111111111',
    circleWalletId: 'circle-wallet-1',
    address: '0xabc',
    blockchain: WalletBlockchain.MATIC_AMOY,
    accountType: 'EOA',
    state: WalletState.LIVE,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('AuthService', () => {
  let prisma: {
    user: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    wallet: {
      createMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  let circleService: { createWallets: ReturnType<typeof vi.fn> };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      wallet: {
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
        findMany: vi.fn(),
      },
    };
    circleService = {
      createWallets: vi.fn(),
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValue('test.access.token'),
    };
    service = new AuthService(
      prisma as unknown as PrismaService,
      circleService as unknown as CircleService,
      jwtService as unknown as JwtService,
    );
  });

  describe('signup', () => {
    const dto = {
      email: 'Ada@Example.com',
      password: 'password1',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };

    it('creates user + 2 wallets and returns 201 payload shape', async () => {
      const user = makeUser({ email: 'ada@example.com' });
      const wallets = [
        makeWallet({
          id: 'w1',
          blockchain: WalletBlockchain.ETH_SEPOLIA,
          address: '0xeth',
          circleWalletId: 'c-eth',
        }),
        makeWallet({
          id: 'w2',
          blockchain: WalletBlockchain.MATIC_AMOY,
          address: '0xmatic',
          circleWalletId: 'c-matic',
        }),
      ];

      prisma.user.create.mockResolvedValue(user);
      circleService.createWallets.mockResolvedValue([
        {
          id: 'c-matic',
          address: '0xmatic',
          blockchain: 'MATIC-AMOY',
          state: 'LIVE',
          accountType: 'EOA',
          walletSetId: 'set-1',
        },
        {
          id: 'c-eth',
          address: '0xeth',
          blockchain: 'ETH-SEPOLIA',
          state: 'LIVE',
          accountType: 'EOA',
          walletSetId: 'set-1',
        },
      ]);
      prisma.wallet.findMany.mockResolvedValue(wallets);

      const result = await service.signup(dto);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'ada@example.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
            passwordHash: expect.not.stringContaining('password1'),
          }),
        }),
      );
      expect(circleService.createWallets).toHaveBeenCalledWith({
        idempotencyKey: `signup-${user.id}`,
        refId: user.id,
      });
      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        accessToken: 'test.access.token',
        wallets: [
          {
            id: 'w1',
            address: '0xeth',
            blockchain: 'ETH-SEPOLIA',
            state: 'LIVE',
          },
          {
            id: 'w2',
            address: '0xmatic',
            blockchain: 'MATIC-AMOY',
            state: 'LIVE',
          },
        ],
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('returns 409 on duplicate email', async () => {
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.signup(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(circleService.createWallets).not.toHaveBeenCalled();
    });

    it('compensates by deleting user when Circle fails (no orphan)', async () => {
      const user = makeUser();
      prisma.user.create.mockResolvedValue(user);
      circleService.createWallets.mockRejectedValue(
        new BadGatewayException('Circle upstream error'),
      );

      await expect(service.signup(dto)).rejects.toBeInstanceOf(
        BadGatewayException,
      );
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(prisma.wallet.createMany).not.toHaveBeenCalled();
    });

    it('compensates when Circle returns incomplete wallets', async () => {
      const user = makeUser();
      prisma.user.create.mockResolvedValue(user);
      circleService.createWallets.mockResolvedValue([
        {
          id: 'only-one',
          address: '0x1',
          blockchain: 'MATIC-AMOY',
          state: 'LIVE',
          accountType: 'EOA',
          walletSetId: 'set-1',
        },
      ]);

      await expect(service.signup(dto)).rejects.toBeInstanceOf(
        BadGatewayException,
      );
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('compensates when wallet persist fails', async () => {
      const user = makeUser();
      prisma.user.create.mockResolvedValue(user);
      circleService.createWallets.mockResolvedValue([
        {
          id: 'c1',
          address: '0x1',
          blockchain: 'MATIC-AMOY',
          state: 'LIVE',
          accountType: 'EOA',
          walletSetId: 'set-1',
        },
        {
          id: 'c2',
          address: '0x2',
          blockchain: 'ETH-SEPOLIA',
          state: 'LIVE',
          accountType: 'EOA',
          walletSetId: 'set-1',
        },
      ]);
      prisma.wallet.createMany.mockRejectedValue(new Error('db down'));

      await expect(service.signup(dto)).rejects.toBeInstanceOf(
        BadGatewayException,
      );
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });
  });

  describe('login', () => {
    it('returns user + accessToken for valid credentials', async () => {
      const passwordHash = await import('bcrypt').then((b) =>
        b.hash('password1', 4),
      );
      const user = makeUser({ passwordHash });
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login({
        email: 'Ada@Example.com',
        password: 'password1',
      });

      expect(result).toEqual({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken: 'test.access.token',
      });
    });

    it('returns 401 for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.com', password: 'password1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns 401 for wrong password', async () => {
      const passwordHash = await import('bcrypt').then((b) =>
        b.hash('password1', 4),
      );
      prisma.user.findUnique.mockResolvedValue(makeUser({ passwordHash }));
      await expect(
        service.login({ email: 'ada@example.com', password: 'wrong-pass' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns public user shape', async () => {
      const user = makeUser();
      prisma.user.findUnique.mockResolvedValue(user);
      await expect(service.getMe(user.id)).resolves.toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    });

    it('returns 401 when user missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe('missing')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
