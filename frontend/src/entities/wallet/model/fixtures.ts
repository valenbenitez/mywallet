import type { WalletBalance, WalletFixture, WalletTransaction } from "./types";

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
  transactions: [
    {
      id: "tx_mock_001",
      direction: "in",
      amount: "100.00",
      token: "USDC",
      counterparty: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      chain: "MATIC-AMOY",
      status: "COMPLETE",
      txHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      createdAt: "2026-09-20T12:00:00.000Z",
    },
    {
      id: "tx_mock_002",
      direction: "out",
      amount: "10.00",
      token: "USDC",
      counterparty: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      chain: "ETH-SEPOLIA",
      status: "QUEUED",
      createdAt: "2026-09-21T15:30:00.000Z",
    },
    {
      id: "tx_mock_003",
      direction: "out",
      amount: "5.25",
      token: "USDC",
      counterparty: "0xcccccccccccccccccccccccccccccccccccccccc",
      chain: "MATIC-AMOY",
      status: "COMPLETE",
      txHash:
        "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      createdAt: "2026-09-19T09:15:00.000Z",
    },
    {
      id: "tx_mock_004",
      direction: "in",
      amount: "25.00",
      token: "USDC",
      counterparty: "0xdddddddddddddddddddddddddddddddddddddddd",
      chain: "ETH-SEPOLIA",
      status: "FAILED",
      createdAt: "2026-09-18T18:45:00.000Z",
    },
    {
      id: "tx_mock_005",
      direction: "out",
      amount: "12.50",
      token: "USDC",
      counterparty: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      chain: "ETH-SEPOLIA",
      status: "COMPLETE",
      txHash:
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      createdAt: "2026-09-17T11:00:00.000Z",
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

export function getMockTransactions(
  wallet: WalletFixture = mockWallet,
): WalletTransaction[] {
  return wallet.transactions;
}

/** Recent txs for dashboard preview — newest first, clamped to 3–5. */
export function getMockRecentTransactions(
  wallet: WalletFixture = mockWallet,
  limit = 4,
): WalletTransaction[] {
  const clamped = Math.min(5, Math.max(3, limit));
  return [...wallet.transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, clamped);
}
