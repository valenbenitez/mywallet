import type { WalletBalance } from "./types";

const EXPLORER_TX_BASE: Record<WalletBalance["chain"], string> = {
  "MATIC-AMOY": "https://amoy.polygonscan.com/tx",
  "ETH-SEPOLIA": "https://sepolia.etherscan.io/tx",
};

/** Mock explorer URL for a completed transfer (testnet bases). */
export function getExplorerUrl(
  chain: WalletBalance["chain"],
  txHash: string,
): string {
  return `${EXPLORER_TX_BASE[chain]}/${txHash}`;
}
