export type WalletBalance = {
  token: "USDC";
  amount: string;
  chain: "MATIC-AMOY" | "ETH-SEPOLIA";
};

export type WalletTransactionStatus = "QUEUED" | "COMPLETE" | "FAILED";

export type WalletTransaction = {
  id: string;
  direction: "in" | "out";
  amount: string;
  token: "USDC";
  counterparty: string;
  chain: WalletBalance["chain"];
  status: WalletTransactionStatus;
  /** Present on COMPLETE mocks for explorer links. */
  txHash?: string;
  createdAt: string;
};

export type WalletFixture = {
  /** Default deposit address (Amoy) — prefer `addressesByChain` for chain-specific UI. */
  address: string;
  addressesByChain: Record<WalletBalance["chain"], string>;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
};

export const CHAIN_LABELS: Record<WalletBalance["chain"], string> = {
  "MATIC-AMOY": "Polygon Amoy",
  "ETH-SEPOLIA": "Ethereum Sepolia",
};
