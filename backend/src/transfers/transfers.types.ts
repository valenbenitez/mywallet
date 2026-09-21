import type {
  TransactionDirection,
  TransactionState,
} from '../domain/transaction.js';
import type { WalletBlockchain } from '../domain/wallet.js';

export type FeeLevelPublic = 'LOW' | 'MEDIUM' | 'HIGH';

export type FeeEstimateLevelPublic = {
  networkFee: string;
  gasLimit?: string;
};

export type FeeEstimateResponse = {
  low?: FeeEstimateLevelPublic;
  medium?: FeeEstimateLevelPublic;
  high?: FeeEstimateLevelPublic;
};

export type TransactionPublic = {
  id: string;
  walletId: string;
  direction: TransactionDirection;
  blockchain: WalletBlockchain;
  tokenSymbol: string;
  amount: string;
  sourceAddress: string;
  destinationAddress: string;
  state: TransactionState;
  txHash: string | null;
  networkFee: string | null;
  createdAt: Date;
};

export type CreateTransferResponse = {
  transaction: TransactionPublic;
};
