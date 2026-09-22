import { describe, expect, it } from "vitest";
import { getExplorerUrl } from "./explorers";
import {
  getMockDepositAddress,
  getMockRecentTransactions,
  getMockTotalUsdcBalance,
  getMockTransactions,
  getMockUsdcBalance,
  getMockUsdcBalances,
  mockWallet,
  truncateAddress,
} from "./fixtures";

describe("wallet fixtures", () => {
  it("provides dual-chain USDC balances without API calls", () => {
    expect(mockWallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(getMockUsdcBalances()).toEqual([
      { token: "USDC", amount: "50.00", chain: "MATIC-AMOY" },
      { token: "USDC", amount: "125.50", chain: "ETH-SEPOLIA" },
    ]);
    expect(getMockUsdcBalance()).toBe("50.00");
    expect(getMockTotalUsdcBalance()).toBe("175.50");
  });

  it("exposes distinct deposit addresses per chain", () => {
    const amoy = getMockDepositAddress("MATIC-AMOY");
    const sepolia = getMockDepositAddress("ETH-SEPOLIA");
    expect(amoy).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(sepolia).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(amoy).not.toBe(sepolia);
    expect(amoy).toBe(mockWallet.address);
  });

  it("truncates addresses for display", () => {
    expect(truncateAddress(mockWallet.address)).toBe("0x1111…1111");
    expect(truncateAddress(mockWallet.address)).not.toHaveLength(42);
    expect(truncateAddress(getMockDepositAddress("ETH-SEPOLIA"))).toBe(
      "0x2222…2222",
    );
  });

  it("exposes ≥5 transactions with chain, statuses, and COMPLETE txHash", () => {
    const all = getMockTransactions();
    expect(all.length).toBeGreaterThanOrEqual(5);
    expect(all.every((tx) => tx.chain === "MATIC-AMOY" || tx.chain === "ETH-SEPOLIA")).toBe(
      true,
    );
    expect(all.every((tx) => Boolean(tx.counterparty))).toBe(true);
    expect(all.some((tx) => tx.status === "COMPLETE")).toBe(true);
    expect(all.some((tx) => tx.status === "QUEUED" || tx.status === "FAILED")).toBe(
      true,
    );
    expect(
      all
        .filter((tx) => tx.status === "COMPLETE")
        .every((tx) => Boolean(tx.txHash)),
    ).toBe(true);

    const recent = getMockRecentTransactions();
    expect(recent.length).toBeGreaterThanOrEqual(3);
    expect(recent.length).toBeLessThanOrEqual(5);
    expect(recent[0]?.id).toBe("tx_mock_002");
  });

  it("builds mock explorer URLs per chain", () => {
    expect(getExplorerUrl("MATIC-AMOY", "0xhash")).toBe(
      "https://amoy.polygonscan.com/tx/0xhash",
    );
    expect(getExplorerUrl("ETH-SEPOLIA", "0xhash")).toBe(
      "https://sepolia.etherscan.io/tx/0xhash",
    );
  });
});
