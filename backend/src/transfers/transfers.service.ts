import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { toApiBlockchain } from '../auth/blockchain.map.js';
import {
  CircleService,
  type CircleFeeEstimate,
  type CircleFeeEstimateLevel,
} from '../circle/circle.service.js';
import {
  Prisma,
  TransactionDirection,
  TransactionState,
  type Transaction,
  type Wallet,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { compareDecimalStrings } from './decimal.js';
import { loadTransferLimits } from './transfers.config.js';
import type {
  CreateTransferResponse,
  FeeEstimateLevelPublic,
  FeeEstimateResponse,
  FeeLevelPublic,
  TransactionPublic,
} from './transfers.types.js';

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circleService: CircleService,
  ) {}

  async estimateFee(
    userId: string,
    walletId: string,
    input: {
      destinationAddress: string;
      amount: string;
      tokenSymbol: 'USDC';
    },
  ): Promise<FeeEstimateResponse> {
    this.assertAmountWithinLimits(input.amount);
    const wallet = await this.findOwnedWallet(userId, walletId);
    const blockchain = toApiBlockchain(wallet.blockchain);
    const tokenId = this.circleService.getUsdcTokenId(blockchain);

    const estimate = await this.circleService.estimateFee({
      circleWalletId: wallet.circleWalletId,
      destinationAddress: input.destinationAddress,
      amount: String(input.amount),
      tokenId,
    });

    return toFeeEstimateResponse(estimate);
  }

  async createTransfer(
    userId: string,
    walletId: string,
    input: {
      destinationAddress: string;
      amount: string;
      tokenSymbol: 'USDC';
      feeLevel: FeeLevelPublic;
      idempotencyKey?: string;
    },
  ): Promise<CreateTransferResponse> {
    this.assertAmountWithinLimits(input.amount);
    const wallet = await this.findOwnedWallet(userId, walletId);
    const blockchain = toApiBlockchain(wallet.blockchain);
    const tokenId = this.circleService.getUsdcTokenId(blockchain);
    const amount = String(input.amount);
    const idempotencyKey = input.idempotencyKey?.trim() || randomUUID();

    await this.assertUniqueIdempotencyKey(idempotencyKey);
    await this.assertSufficientUsdcBalance(wallet.circleWalletId, tokenId, amount);

    let transaction: Transaction;
    try {
      transaction = await this.prisma.transaction.create({
        data: {
          walletId: wallet.id,
          idempotencyKey,
          direction: TransactionDirection.OUTBOUND,
          blockchain: wallet.blockchain,
          tokenId,
          tokenSymbol: 'USDC',
          amount,
          sourceAddress: wallet.address,
          destinationAddress: input.destinationAddress,
          state: TransactionState.INITIATED,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('idempotencyKey already used');
      }
      throw error;
    }

    try {
      const circleTx = await this.circleService.createTransfer({
        circleWalletId: wallet.circleWalletId,
        destinationAddress: input.destinationAddress,
        amount,
        tokenId,
        feeLevel: input.feeLevel,
        idempotencyKey,
      });

      transaction = await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          circleTransactionId: circleTx.id,
        },
      });
    } catch (error) {
      if (isInsufficientBalanceError(error)) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            state: TransactionState.FAILED,
            errorReason: 'Insufficient USDC balance',
          },
        });
        throw new UnprocessableEntityException({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Insufficient USDC balance',
        });
      }

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          state: TransactionState.FAILED,
          errorReason:
            error instanceof Error ? error.message : 'Circle transfer failed',
        },
      });
      throw error;
    }

    return { transaction: toTransactionPublic(transaction) };
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

  private assertAmountWithinLimits(amount: string): void {
    const { minUsdc, maxUsdc } = loadTransferLimits();
    if (compareDecimalStrings(amount, minUsdc) < 0) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: `Amount below TRANSFER_MIN_USDC (${minUsdc})`,
        code: 'TRANSFER_MIN_USDC',
      });
    }
    if (compareDecimalStrings(amount, maxUsdc) > 0) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: `Amount above TRANSFER_MAX_USDC (${maxUsdc})`,
        code: 'TRANSFER_MAX_USDC',
      });
    }
  }

  private async assertUniqueIdempotencyKey(idempotencyKey: string): Promise<void> {
    const existing = await this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      throw new ConflictException('idempotencyKey already used');
    }
  }

  private async assertSufficientUsdcBalance(
    circleWalletId: string,
    tokenId: string,
    amount: string,
  ): Promise<void> {
    const balances = await this.circleService.getBalances(circleWalletId);
    const usdc = balances.find(
      (balance) =>
        balance.tokenId === tokenId || balance.tokenSymbol.toUpperCase() === 'USDC',
    );
    if (!usdc || compareDecimalStrings(String(usdc.amount), amount) < 0) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: 'Insufficient USDC balance',
      });
    }
  }
}

function toFeeEstimateResponse(estimate: CircleFeeEstimate): FeeEstimateResponse {
  return {
    low: toFeeLevelPublic(estimate.low),
    medium: toFeeLevelPublic(estimate.medium),
    high: toFeeLevelPublic(estimate.high),
  };
}

function toFeeLevelPublic(
  level: CircleFeeEstimateLevel | undefined,
): FeeEstimateLevelPublic | undefined {
  if (!level) {
    return undefined;
  }
  return {
    networkFee: String(level.networkFee),
    ...(level.gasLimit != null ? { gasLimit: String(level.gasLimit) } : {}),
  };
}

function toTransactionPublic(tx: Transaction): TransactionPublic {
  return {
    id: tx.id,
    walletId: tx.walletId,
    direction: tx.direction,
    blockchain: toApiBlockchain(tx.blockchain),
    tokenSymbol: tx.tokenSymbol,
    amount: String(tx.amount),
    sourceAddress: tx.sourceAddress,
    destinationAddress: tx.destinationAddress,
    state: tx.state,
    txHash: tx.txHash,
    networkFee: tx.networkFee != null ? String(tx.networkFee) : null,
    createdAt: tx.createdAt,
  };
}

function isInsufficientBalanceError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : '';
  return /insufficient/i.test(message);
}
