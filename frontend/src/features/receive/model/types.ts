import type { WalletBalance } from "@/entities/wallet";

export type ReceiveChain = WalletBalance["chain"];

export const RECEIVE_CHAINS: ReceiveChain[] = ["MATIC-AMOY", "ETH-SEPOLIA"];

/** Short non-jargon hint for the active testnet. */
export const RECEIVE_NETWORK_HINTS: Record<ReceiveChain, string> = {
  "MATIC-AMOY": "Send only testnet USDC on Polygon Amoy.",
  "ETH-SEPOLIA": "Send only testnet USDC on Ethereum Sepolia.",
};
