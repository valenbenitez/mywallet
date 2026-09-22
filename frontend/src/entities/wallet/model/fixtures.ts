import type { WalletBalance, WalletFixture } from "./types";

/** Happy-path mock wallet — no real Circle/API calls. */
export const mockWallet: WalletFixture = {
  address: "0x1111111111111111111111111111111111111111",
  addressesByChain: {
    "MATIC-AMOY": "0x1111111111111111111111111111111111111111",
    "ETH-SEPOLIA": "0x2222222222222222222222222222222222222222",
  },
  balances: [
    {
      token: "USDC",
      amount: "50.00",
      chain: "MATIC-AMOY",
    },
    {
      token: "USDC",
      amount: "125.50",
      chain: "ETH-SEPOLIA",
    },
  ],
};

/** Truncate a 0x address for display: 0x1111…1111 */
export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Deposit address for the active chain (mock). */
export function getMockDepositAddress(
  chain: WalletBalance["chain"],
  wallet: WalletFixture = mockWallet,
): string {
  return wallet.addressesByChain[chain];
}

export function getMockUsdcBalance(wallet: WalletFixture = mockWallet): string {
  const usdc = wallet.balances.find((b) => b.token === "USDC");
  return usdc?.amount ?? "0";
}

export function getMockUsdcBalances(wallet: WalletFixture = mockWallet) {
  return wallet.balances.filter((b) => b.token === "USDC");
}

/** Sum of USDC across chains for hero available balance. */
export function getMockTotalUsdcBalance(
  wallet: WalletFixture = mockWallet,
): string {
  const total = getMockUsdcBalances(wallet).reduce(
    (sum, balance) => sum + Number.parseFloat(balance.amount),
    0,
  );
  return total.toFixed(2);
}
