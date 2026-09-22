import type { WalletBalance } from "@/entities/wallet";

export type TransactionDirection = "OUTBOUND" | "INBOUND";

export type TransactionState =
  | "INITIATED"
  | "QUEUED"
  | "CLEARED"
  | "SENT"
  | "STUCK"
  | "CONFIRMED"
  | "COMPLETE"
  | "CANCELLED"
  | "FAILED"
  | "DENIED";

export type TransactionBlockchain = WalletBalance["chain"];

/** Matches backend `TransactionPublic` (JSON dates as ISO strings). */
export type TransactionPublic = {
  id: string;
  walletId: string;
  direction: TransactionDirection;
  blockchain: TransactionBlockchain;
  tokenSymbol: string;
  amount: string;
  sourceAddress: string;
  destinationAddress: string;
  state: TransactionState;
  txHash: string | null;
  networkFee: string | null;
  createdAt: string;
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

/** Row model for tx list / preview widgets. */
export type TransactionRow = {
  id: string;
  direction: TransactionDirection;
  amount: string;
  token: string;
  counterparty: string;
  chain: TransactionBlockchain;
  status: TransactionState;
  txHash: string | null;
  createdAt: string;
};
