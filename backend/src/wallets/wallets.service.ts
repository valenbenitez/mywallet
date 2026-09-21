import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toApiBlockchain } from '../auth/blockchain.map.js';
import { CircleService } from '../circle/circle.service.js';
import type { Wallet } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  WalletBalancesResponse,
  WalletListResponse,
  WalletPublic,
} from './wallets.types.js';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circleService: CircleService,
  ) {}

  async listForUser(userId: string): Promise<WalletListResponse> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { blockchain: 'asc' },
    });
    return { wallets: wallets.map(toWalletPublic) };
  }

  async getForUser(userId: string, walletId: string): Promise<WalletPublic> {
    const wallet = await this.findOwnedWallet(userId, walletId);
    return toWalletPublic(wallet);
  }

  async getBalancesForUser(
    userId: string,
    walletId: string,
  ): Promise<WalletBalancesResponse> {
    const wallet = await this.findOwnedWallet(userId, walletId);
    const balances = await this.circleService.getBalances(wallet.circleWalletId);
    return {
      balances: balances.map((balance) => ({
        tokenId: balance.tokenId,
        tokenSymbol: balance.tokenSymbol,
        // Circle returns decimal strings — keep as string, never coerce to number.
        amount: String(balance.amount),
      })),
    };
  }

  /**
   * Ownership: missing → 404; exists but other user → 403.
   */
  private async findOwnedWallet(
    userId: string,
    walletId: string,
  ): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.userId !== userId) {
      throw new ForbiddenException('Wallet does not belong to user');
    }
    return wallet;
  }
}

function toWalletPublic(wallet: Wallet): WalletPublic {
  return {
    id: wallet.id,
    circleWalletId: wallet.circleWalletId,
    address: wallet.address,
    blockchain: toApiBlockchain(wallet.blockchain),
    accountType: wallet.accountType,
    state: wallet.state,
    createdAt: wallet.createdAt,
  };
}
