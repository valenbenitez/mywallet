import type { WalletFixture } from "./types";

/** Happy-path mock wallet — no real Circle/API calls. */
export const mockWallet: WalletFixture = {
  address: "0x1111111111111111111111111111111111111111",
  balances: [
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
      status: "COMPLETE",
      createdAt: "2026-09-20T12:00:00.000Z",
    },
    {
      id: "tx_mock_002",
      direction: "out",
      amount: "10.00",
      token: "USDC",
      counterparty: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      status: "QUEUED",
      createdAt: "2026-09-21T15:30:00.000Z",
    },
  ],
};

export function getMockUsdcBalance(wallet: WalletFixture = mockWallet): string {
  const usdc = wallet.balances.find((b) => b.token === "USDC");
  return usdc?.amount ?? "0";
}

export function getMockTransactions(
  wallet: WalletFixture = mockWallet,
): WalletFixture["transactions"] {
  return wallet.transactions;
}
