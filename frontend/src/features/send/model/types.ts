import type { WalletBalance } from "@/entities/wallet";

export type SendChain = WalletBalance["chain"];

export type SendStep = "form" | "confirm" | "success";

export type SendDraft = {
  chain: SendChain;
  destinationAddress: string;
  amount: string;
};

/** Aligns loosely with backend FeeEstimateLevelPublic for later wiring. */
export type FeeEstimateLevelMock = {
  networkFee: string;
  gasLimit: string;
};

/** Aligns loosely with backend FeeEstimateResponse. */
export type FeeEstimateMock = {
  low: FeeEstimateLevelMock;
  medium: FeeEstimateLevelMock;
  high: FeeEstimateLevelMock;
};
