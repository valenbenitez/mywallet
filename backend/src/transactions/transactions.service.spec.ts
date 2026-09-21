import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TransactionDirection,
  TransactionState,
  WalletBlockchain,
  type Transaction,
} from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { encodeTransactionCursor } from './cursor.js';
import { TransactionsService } from './transactions.service.js';

const USER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_USER_ID = '99999999-9999-9999-9999-999999999999';
const WALLET_ID = '22222222-2222-2222-2222-222222222222';
const OTHER_WALLET_ID = '33333333-3333-3333-3333-333333333333';
const TX_ID = '44444444-4444-4444-4444-444444444444';

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: TX_ID,
    walletId: WALLET_ID,
    circleTransactionId: null,
    idempotencyKey: null,
    direction: TransactionDirection.OUTBOUND,
    blockchain: WalletBlockchain.MATIC_AMOY,
    tokenId: 'tok-usdc',
    tokenSymbol: 'USDC',
    amount: '10.00',
    sourceAddress: '0xsrc',
    destinationAddress: '0xdst',
    state: TransactionState.COMPLETE,
    txHash: '0xhash',
    networkFee: '0.001',
    errorReason: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('TransactionsService', () => {
  let prisma: {
    wallet: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    transaction: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let service: TransactionsService;

  beforeEach(() => {
    prisma = {
      wallet: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      transaction: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    service = new TransactionsService(prisma as unknown as PrismaService);
  });

  describe('listForUser', () => {
    it('returns empty items when user has no wallets', async () => {
      prisma.wallet.findMany.mockResolvedValue([]);

      await expect(service.listForUser(USER_ID)).resolves.toEqual({
        items: [],
        nextCursor: null,
      });
      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
    });

    it('lists only txs for user wallets with public shape and default limit 20', async () => {
      const createdAt = new Date('2026-02-01T00:00:00.000Z');
      prisma.wallet.findMany.mockResolvedValue([{ id: WALLET_ID }]);
      prisma.transaction.findMany.mockResolvedValue([
        makeTx({ createdAt, networkFee: null, txHash: null }),
      ]);

      const result = await service.listForUser(USER_ID);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { walletId: { in: [WALLET_ID] } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 21,
      });
      expect(result).toEqual({
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
            txHash: null,
            networkFee: null,
            createdAt,
          },
        ],
        nextCursor: null,
      });
      expect(typeof result.items[0].amount).toBe('string');
    });

    it('filters by walletId, direction, and state', async () => {
      prisma.wallet.findMany.mockResolvedValue([{ id: WALLET_ID }]);
      prisma.transaction.findMany.mockResolvedValue([]);

      await service.listForUser(USER_ID, {
        walletId: WALLET_ID,
        direction: 'INBOUND',
        state: 'QUEUED',
        limit: 5,
      });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          walletId: WALLET_ID,
          direction: 'INBOUND',
          state: 'QUEUED',
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 6,
      });
    });

    it('returns 404 when filter walletId does not exist', async () => {
      prisma.wallet.findMany.mockResolvedValue([{ id: WALLET_ID }]);
      prisma.wallet.findUnique.mockResolvedValue(null);

      await expect(
        service.listForUser(USER_ID, { walletId: OTHER_WALLET_ID }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
    });

    it('returns 403 when filter walletId belongs to another user', async () => {
      prisma.wallet.findMany.mockResolvedValue([{ id: WALLET_ID }]);
      prisma.wallet.findUnique.mockResolvedValue({ userId: OTHER_USER_ID });

      await expect(
        service.listForUser(USER_ID, { walletId: OTHER_WALLET_ID }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.transaction.findMany).not.toHaveBeenCalled();
    });

    it('applies cursor and returns nextCursor when more rows exist', async () => {
      const t1 = makeTx({
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      });
      const t2 = makeTx({
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      });
      const t3 = makeTx({
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      prisma.wallet.findMany.mockResolvedValue([{ id: WALLET_ID }]);
      prisma.transaction.findMany.mockResolvedValue([t1, t2, t3]);

      const cursor = encodeTransactionCursor(
        new Date('2026-01-04T00:00:00.000Z'),
        'zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz',
      );
      const result = await service.listForUser(USER_ID, { limit: 2, cursor });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
          where: expect.objectContaining({
            walletId: { in: [WALLET_ID] },
            AND: [
              {
                OR: [
                  { createdAt: { lt: new Date('2026-01-04T00:00:00.000Z') } },
                  {
                    createdAt: new Date('2026-01-04T00:00:00.000Z'),
                    id: { lt: 'zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz' },
                  },
                ],
              },
            ],
          }),
        }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBe(
        encodeTransactionCursor(t2.createdAt, t2.id),
      );
    });
  });

  describe('getForUser', () => {
    it('returns transaction detail for owner', async () => {
      const tx = makeTx();
      prisma.transaction.findUnique.mockResolvedValue({
        ...tx,
        wallet: { userId: USER_ID },
      });

      await expect(service.getForUser(USER_ID, TX_ID)).resolves.toEqual({
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
        createdAt: tx.createdAt,
      });
    });

    it('returns 404 when transaction does not exist', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.getForUser(USER_ID, TX_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns 403 when transaction wallet belongs to another user', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        ...makeTx(),
        wallet: { userId: OTHER_USER_ID },
      });
      await expect(service.getForUser(USER_ID, TX_ID)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
