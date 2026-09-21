import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CircleDeveloperControlledWalletsClient,
  initiateDeveloperControlledWalletsClient,
  type FeeLevel,
} from '@circle-fin/developer-controlled-wallets';
import type { WalletBlockchain } from '../domain/wallet.js';
import {
  loadCircleClientCredentials,
  loadCircleEnv,
  loadCircleWalletSetId,
} from './circle.config.js';
import { mapCircleError } from './circle.errors.js';

const MVP_BLOCKCHAINS: WalletBlockchain[] = ['MATIC-AMOY', 'ETH-SEPOLIA'];

export type CircleWalletSummary = {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  accountType: string;
  walletSetId: string;
};

export type CircleBalance = {
  tokenId: string;
  tokenSymbol: string;
  amount: string;
};

export type CircleFeeEstimateLevel = {
  networkFee: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFee?: string;
  priorityFee?: string;
  baseFee?: string;
};

export type CircleFeeEstimate = {
  low?: CircleFeeEstimateLevel;
  medium?: CircleFeeEstimateLevel;
  high?: CircleFeeEstimateLevel;
};

export type CircleTransferResult = {
  id: string;
  state: string;
};

export type CreateTransferInput = {
  circleWalletId: string;
  destinationAddress: string;
  amount: string;
  tokenId: string;
  feeLevel: FeeLevel;
  idempotencyKey: string;
};

export type EstimateFeeInput = {
  circleWalletId: string;
  destinationAddress: string;
  amount: string;
  tokenId: string;
};

export type CircleWalletSetSummary = {
  id: string;
  createDate?: string;
  updateDate?: string;
};

type FeeFields = {
  networkFee?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFee?: string;
  priorityFee?: string;
  baseFee?: string;
};

@Injectable()
export class CircleService implements OnModuleInit {
  private client!: CircleDeveloperControlledWalletsClient;

  onModuleInit(): void {
    const { apiKey, entitySecret } = loadCircleClientCredentials();
    // SDK encrypts Entity Secret per request; never log credentials.
    this.client = initiateDeveloperControlledWalletsClient({
      apiKey,
      entitySecret,
    });
  }

  async createWalletSet(name: string): Promise<{
    walletSet: CircleWalletSetSummary;
    note: string;
  }> {
    try {
      const response = await this.client.createWalletSet({ name });
      const walletSet = response.data?.walletSet;
      if (!walletSet?.id) {
        throw new Error('Circle createWalletSet returned no walletSet.id');
      }
      return {
        walletSet: {
          id: walletSet.id,
          createDate: walletSet.createDate,
          updateDate: walletSet.updateDate,
        },
        note: 'Copy walletSet.id into CIRCLE_WALLET_SET_ID and restart the server.',
      };
    } catch (error) {
      mapCircleError(error);
    }
  }

  async getWalletSet(id: string): Promise<CircleWalletSetSummary> {
    try {
      const response = await this.client.getWalletSet({ id });
      const walletSet = response.data?.walletSet;
      if (!walletSet?.id) {
        throw new Error('Circle getWalletSet returned no walletSet');
      }
      return {
        id: walletSet.id,
        createDate: walletSet.createDate,
        updateDate: walletSet.updateDate,
      };
    } catch (error) {
      mapCircleError(error);
    }
  }

  async listWalletSets(): Promise<CircleWalletSetSummary[]> {
    try {
      const response = await this.client.listWalletSets();
      const sets = response.data?.walletSets ?? [];
      return sets.map(
        (walletSet: {
          id: string;
          createDate?: string;
          updateDate?: string;
        }) => ({
          id: walletSet.id,
          createDate: walletSet.createDate,
          updateDate: walletSet.updateDate,
        }),
      );
    } catch (error) {
      mapCircleError(error);
    }
  }

  /**
   * Creates one EOA wallet per MVP chain in the configured wallet set.
   */
  async createWallets(options?: {
    idempotencyKey?: string;
    refId?: string;
  }): Promise<CircleWalletSummary[]> {
    const walletSetId = loadCircleWalletSetId();
    try {
      const response = await this.client.createWallets({
        accountType: 'EOA',
        blockchains: MVP_BLOCKCHAINS,
        count: 1,
        walletSetId,
        idempotencyKey: options?.idempotencyKey,
        metadata: options?.refId ? [{ refId: options.refId }] : undefined,
      });
      const wallets = response.data?.wallets ?? [];
      return wallets.map(
        (wallet: {
          id: string;
          address: string;
          blockchain: string;
          state: string;
          accountType: string;
          walletSetId: string;
        }) => ({
          id: wallet.id,
          address: wallet.address,
          blockchain: wallet.blockchain,
          state: wallet.state,
          accountType: wallet.accountType,
          walletSetId: wallet.walletSetId,
        }),
      );
    } catch (error) {
      mapCircleError(error);
    }
  }

  async getBalances(circleWalletId: string): Promise<CircleBalance[]> {
    try {
      const response = await this.client.getWalletTokenBalance({
        id: circleWalletId,
      });
      const tokenBalances = response.data?.tokenBalances ?? [];
      return tokenBalances.map(
        (balance: {
          amount: string;
          token: { id: string; symbol?: string; name?: string };
        }) => ({
          tokenId: balance.token.id,
          tokenSymbol: balance.token.symbol ?? balance.token.name ?? 'UNKNOWN',
          // Circle returns decimal strings — never coerce to number/float.
          amount: String(balance.amount),
        }),
      );
    } catch (error) {
      mapCircleError(error);
    }
  }

  async estimateFee(input: EstimateFeeInput): Promise<CircleFeeEstimate> {
    try {
      const response = await this.client.estimateTransferFee({
        walletId: input.circleWalletId,
        destinationAddress: input.destinationAddress,
        amount: [input.amount],
        tokenId: input.tokenId,
      });
      const data = response.data;
      return {
        low: mapFeeLevel(data?.low),
        medium: mapFeeLevel(data?.medium),
        high: mapFeeLevel(data?.high),
      };
    } catch (error) {
      mapCircleError(error);
    }
  }

  async createTransfer(
    input: CreateTransferInput,
  ): Promise<CircleTransferResult> {
    try {
      const response = await this.client.createTransaction({
        walletId: input.circleWalletId,
        destinationAddress: input.destinationAddress,
        amount: [input.amount],
        tokenId: input.tokenId,
        idempotencyKey: input.idempotencyKey,
        fee: {
          type: 'level',
          config: { feeLevel: input.feeLevel },
        },
      });
      const tx = response.data;
      if (!tx?.id) {
        throw new Error('Circle createTransaction returned no id');
      }
      return {
        id: tx.id,
        state: tx.state,
      };
    } catch (error) {
      mapCircleError(error);
    }
  }

  /** Resolves USDC token id for an MVP chain from env. */
  getUsdcTokenId(blockchain: WalletBlockchain): string {
    const env = loadCircleEnv();
    if (blockchain === 'MATIC-AMOY') {
      return env.usdcTokenIdMatic;
    }
    return env.usdcTokenIdEth;
  }
}

function mapFeeLevel(
  fee: FeeFields | undefined,
): CircleFeeEstimateLevel | undefined {
  if (!fee) {
    return undefined;
  }
  return {
    networkFee: fee.networkFee != null ? String(fee.networkFee) : '0',
    gasLimit: fee.gasLimit != null ? String(fee.gasLimit) : undefined,
    gasPrice: fee.gasPrice != null ? String(fee.gasPrice) : undefined,
    maxFee: fee.maxFee != null ? String(fee.maxFee) : undefined,
    priorityFee: fee.priorityFee != null ? String(fee.priorityFee) : undefined,
    baseFee: fee.baseFee != null ? String(fee.baseFee) : undefined,
  };
}
