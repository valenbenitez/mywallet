import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toApiBlockchain } from '../auth/blockchain.map.js';
import {
  Prisma,
  type Transaction,
  type TransactionDirection,
  type TransactionState,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  decodeTransactionCursor,
  encodeTransactionCursor,
} from './cursor.js';
import type {
  ListTransactionsQuery,
  TransactionListResponse,
  TransactionPublic,
} from './transactions.types.js';

const DEFAULT_LIMIT = 20;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(
    userId: string,
    query: ListTransactionsQuery = {},
  ): Promise<TransactionListResponse> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const ownedWalletIds = await this.listOwnedWalletIds(userId);

    if (ownedWalletIds.length === 0) {
      return { items: [], nextCursor: null };
    }

    let walletFilter: string | { in: string[] } = { in: ownedWalletIds };
    if (query.walletId) {
      await this.assertOwnedWalletId(userId, query.walletId, ownedWalletIds);
      walletFilter = query.walletId;
    }

    const where: Prisma.TransactionWhereInput = {
      walletId: walletFilter,
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.state ? { state: query.state } : {}),
    };

    if (query.cursor) {
      const cursor = decodeTransactionCursor(query.cursor);
      const cursorCreatedAt = new Date(cursor.createdAt);
      where.AND = [
        {
          OR: [
            { createdAt: { lt: cursorCreatedAt } },
            {
              createdAt: cursorCreatedAt,
              id: { lt: cursor.id },
            },
          ],
        },
      ];
    }

    const rows = await this.prisma.transaction.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeTransactionCursor(last.createdAt, last.id)
        : null;

    return {
      items: page.map(toTransactionPublic),
      nextCursor,
    };
  }

  async getForUser(userId: string, transactionId: string): Promise<TransactionPublic> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: { select: { userId: true } } },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.wallet.userId !== userId) {
      throw new ForbiddenException('Transaction does not belong to user');
    }

    return toTransactionPublic(transaction);
  }

  private async listOwnedWalletIds(userId: string): Promise<string[]> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    });
    return wallets.map((w) => w.id);
  }

  /**
   * Missing wallet → 404; exists but other user → 403.
   * Uses preloaded owned ids when available to avoid an extra round-trip on happy path.
   */
  private async assertOwnedWalletId(
    userId: string,
    walletId: string,
    ownedWalletIds: string[],
  ): Promise<void> {
    if (ownedWalletIds.includes(walletId)) {
      return;
    }
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { userId: true },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.userId !== userId) {
      throw new ForbiddenException('Wallet does not belong to user');
    }
  }
}

export function toTransactionPublic(tx: Transaction): TransactionPublic {
  return {
    id: tx.id,
    walletId: tx.walletId,
    direction: tx.direction as TransactionDirection,
    blockchain: toApiBlockchain(tx.blockchain),
    tokenSymbol: tx.tokenSymbol,
    amount: String(tx.amount),
    sourceAddress: tx.sourceAddress,
    destinationAddress: tx.destinationAddress,
    state: tx.state as TransactionState,
    txHash: tx.txHash,
    networkFee: tx.networkFee != null ? String(tx.networkFee) : null,
    createdAt: tx.createdAt,
  };
}
