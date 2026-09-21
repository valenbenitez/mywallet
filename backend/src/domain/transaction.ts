import type { WalletBlockchain } from './wallet.js';

export type TransactionDirection = 'OUTBOUND' | 'INBOUND';

/**
 * Circle transaction lifecycle states.
 * Terminal: COMPLETE | FAILED | CANCELLED | DENIED
 */
export type TransactionState =
  | 'INITIATED'
  | 'QUEUED'
  | 'CLEARED'
  | 'SENT'
  | 'STUCK'
  | 'CONFIRMED'
  | 'COMPLETE'
  | 'CANCELLED'
  | 'FAILED'
  | 'DENIED';

export interface Transaction {
  id: string;
  walletId: string;
  circleTransactionId: string | null;
  idempotencyKey: string | null;
  direction: TransactionDirection;
  blockchain: WalletBlockchain;
  tokenId: string;
  tokenSymbol: string;
  amount: string;
  sourceAddress: string;
  destinationAddress: string;
  state: TransactionState;
  txHash: string | null;
  networkFee: string | null;
  errorReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
