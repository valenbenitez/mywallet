import { describe, expect, it } from "vitest";
import { formatMockNetworkFee, getMockFeeEstimate } from "./mock-fee";

describe("getMockFeeEstimate", () => {
  it("returns Amoy fee levels with string networkFee", () => {
    const estimate = getMockFeeEstimate({ chain: "MATIC-AMOY" });

    expect(estimate.medium.networkFee).toBe("0.002");
    expect(typeof estimate.low.networkFee).toBe("string");
    expect(typeof estimate.high.networkFee).toBe("string");
  });

  it("returns Sepolia fee levels distinct from Amoy", () => {
    const amoy = getMockFeeEstimate({ chain: "MATIC-AMOY" });
    const sepolia = getMockFeeEstimate({ chain: "ETH-SEPOLIA" });

    expect(sepolia.medium.networkFee).toBe("0.0006");
    expect(sepolia.medium.networkFee).not.toBe(amoy.medium.networkFee);
  });
});

describe("formatMockNetworkFee", () => {
  it("formats the medium network fee for display", () => {
    const estimate = getMockFeeEstimate({ chain: "MATIC-AMOY" });
    expect(formatMockNetworkFee(estimate)).toBe("0.002 network fee");
  });
});
