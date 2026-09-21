import type {
  TransactionDirection,
  TransactionState,
} from '../domain/transaction.js';
import type { WalletBlockchain } from '../domain/wallet.js';

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

export type TransactionListResponse = {
  items: TransactionPublic[];
  nextCursor: string | null;
};

export type ListTransactionsQuery = {
  walletId?: string;
  direction?: TransactionDirection;
  state?: TransactionState;
  limit?: number;
  cursor?: string;
};
