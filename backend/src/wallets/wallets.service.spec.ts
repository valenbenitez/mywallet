import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CircleService } from '../circle/circle.service.js';
import {
  WalletBlockchain,
  WalletState,
  type Wallet,
} from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { WalletsService } from './wallets.service.js';

const USER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_USER_ID = '99999999-9999-9999-9999-999999999999';
const WALLET_ID = '22222222-2222-2222-2222-222222222222';

function makeWallet(overrides: Partial<Wallet> = {}): Wallet {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: WALLET_ID,
    userId: USER_ID,
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

describe('WalletsService', () => {
  let prisma: {
    wallet: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let circleService: { getBalances: ReturnType<typeof vi.fn> };
  let service: WalletsService;

  beforeEach(() => {
    prisma = {
      wallet: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    circleService = {
      getBalances: vi.fn(),
    };
    service = new WalletsService(
      prisma as unknown as PrismaService,
      circleService as unknown as CircleService,
    );
  });

  describe('listForUser', () => {
    it('returns wallets for user with contract shape (MATIC-AMOY, ETH-SEPOLIA)', async () => {
      const now = new Date('2026-01-01T00:00:00.000Z');
      prisma.wallet.findMany.mockResolvedValue([
        makeWallet({
          id: 'w-eth',
          blockchain: WalletBlockchain.ETH_SEPOLIA,
          address: '0xeth',
          circleWalletId: 'c-eth',
          createdAt: now,
        }),
        makeWallet({
          id: 'w-matic',
          blockchain: WalletBlockchain.MATIC_AMOY,
          address: '0xmatic',
          circleWalletId: 'c-matic',
          createdAt: now,
        }),
      ]);

      const result = await service.listForUser(USER_ID);

      expect(prisma.wallet.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { blockchain: 'asc' },
      });
      expect(result).toEqual({
        wallets: [
          {
            id: 'w-eth',
            circleWalletId: 'c-eth',
            address: '0xeth',
            blockchain: 'ETH-SEPOLIA',
            accountType: 'EOA',
            state: 'LIVE',
            createdAt: now,
          },
          {
            id: 'w-matic',
            circleWalletId: 'c-matic',
            address: '0xmatic',
            blockchain: 'MATIC-AMOY',
            accountType: 'EOA',
            state: 'LIVE',
            createdAt: now,
          },
        ],
      });
    });
  });

  describe('getForUser', () => {
    it('returns wallet detail for owner', async () => {
      const wallet = makeWallet();
      prisma.wallet.findUnique.mockResolvedValue(wallet);

      await expect(service.getForUser(USER_ID, WALLET_ID)).resolves.toEqual({
        id: wallet.id,
        circleWalletId: wallet.circleWalletId,
        address: wallet.address,
        blockchain: 'MATIC-AMOY',
        accountType: 'EOA',
        state: 'LIVE',
        createdAt: wallet.createdAt,
      });
    });

    it('returns 404 when wallet does not exist', async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);
      await expect(service.getForUser(USER_ID, WALLET_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns 403 when wallet belongs to another user', async () => {
      prisma.wallet.findUnique.mockResolvedValue(
        makeWallet({ userId: OTHER_USER_ID }),
      );
      await expect(service.getForUser(USER_ID, WALLET_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('getBalancesForUser', () => {
    it('returns live Circle balances as string decimals', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      circleService.getBalances.mockResolvedValue([
        { tokenId: 'tok-usdc', tokenSymbol: 'USDC', amount: '12.50' },
        { tokenId: 'tok-eth', tokenSymbol: 'ETH', amount: '0.001' },
      ]);

      const result = await service.getBalancesForUser(USER_ID, WALLET_ID);

      expect(circleService.getBalances).toHaveBeenCalledWith('circle-wallet-1');
      expect(result).toEqual({
        balances: [
          { tokenId: 'tok-usdc', tokenSymbol: 'USDC', amount: '12.50' },
          { tokenId: 'tok-eth', tokenSymbol: 'ETH', amount: '0.001' },
        ],
      });
      expect(typeof result.balances[0].amount).toBe('string');
    });

    it('enforces ownership before calling Circle', async () => {
      prisma.wallet.findUnique.mockResolvedValue(
        makeWallet({ userId: OTHER_USER_ID }),
      );

      await expect(
        service.getBalancesForUser(USER_ID, WALLET_ID),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(circleService.getBalances).not.toHaveBeenCalled();
    });

    it('returns 404 when wallet missing', async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);
      await expect(
        service.getBalancesForUser(USER_ID, WALLET_ID),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(circleService.getBalances).not.toHaveBeenCalled();
    });
  });
});
