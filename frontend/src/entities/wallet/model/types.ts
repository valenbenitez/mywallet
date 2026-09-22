export type WalletBalance = {
  token: "USDC";
  amount: string;
  chain: "MATIC-AMOY" | "ETH-SEPOLIA";
};

export type WalletFixture = {
  /** Default deposit address (Amoy) — prefer `addressesByChain` for chain-specific UI. */
  address: string;
  addressesByChain: Record<WalletBalance["chain"], string>;
  balances: WalletBalance[];
};

export const CHAIN_LABELS: Record<WalletBalance["chain"], string> = {
  "MATIC-AMOY": "Polygon Amoy",
  "ETH-SEPOLIA": "Ethereum Sepolia",
};
