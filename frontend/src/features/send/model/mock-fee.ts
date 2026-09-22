import type { FeeEstimateMock, SendChain, SendDraft } from "./types";

const FEE_BY_CHAIN: Record<SendChain, FeeEstimateMock> = {
  "MATIC-AMOY": {
    low: { networkFee: "0.001", gasLimit: "65000" },
    medium: { networkFee: "0.002", gasLimit: "65000" },
    high: { networkFee: "0.003", gasLimit: "65000" },
  },
  "ETH-SEPOLIA": {
    low: { networkFee: "0.0004", gasLimit: "65000" },
    medium: { networkFee: "0.0006", gasLimit: "65000" },
    high: { networkFee: "0.0009", gasLimit: "65000" },
  },
};

/**
 * Happy-path mock fee estimate — no Circle/API.
 * Draft is accepted for future wiring (destinationAddress, amount, chain).
 */
export function getMockFeeEstimate(draft: Pick<SendDraft, "chain">): FeeEstimateMock {
  return FEE_BY_CHAIN[draft.chain];
}

/** Display string for the medium (default) network fee. */
export function formatMockNetworkFee(estimate: FeeEstimateMock): string {
  return `${estimate.medium.networkFee} network fee`;
}
