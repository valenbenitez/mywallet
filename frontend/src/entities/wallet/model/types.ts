export type WalletBalance = {
  token: "USDC";
  amount: string;
  chain: string;
};

export type WalletTransactionStatus = "QUEUED" | "COMPLETE" | "FAILED";

export type WalletTransaction = {
  id: string;
  direction: "in" | "out";
  amount: string;
  token: "USDC";
  counterparty: string;
  status: WalletTransactionStatus;
  createdAt: string;
};

export type WalletFixture = {
  address: string;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
};
