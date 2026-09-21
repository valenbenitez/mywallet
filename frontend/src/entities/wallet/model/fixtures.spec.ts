import { describe, expect, it } from "vitest";
import {
  getMockTransactions,
  getMockUsdcBalance,
  mockWallet,
} from "./fixtures";

describe("wallet fixtures", () => {
  it("provides a happy-path mock wallet without API calls", () => {
    expect(mockWallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(getMockUsdcBalance()).toBe("125.50");
    expect(getMockTransactions()).toHaveLength(2);
    expect(getMockTransactions()[0]?.status).toBe("COMPLETE");
  });
});
