import type { WalletBalance } from "@/entities/wallet";

export type SendChain = WalletBalance["chain"];

export type SendStep = "form" | "confirm" | "success";

export type SendDraft = {
  chain: SendChain;
  destinationAddress: string;
  amount: string;
};

export type FeeLevel = "LOW" | "MEDIUM" | "HIGH";

export type FeeEstimateLevel = {
  networkFee: string;
  gasLimit?: string;
};

/** Matches backend FeeEstimateResponse — levels may be omitted. */
export type FeeEstimateResponse = {
  low?: FeeEstimateLevel;
  medium?: FeeEstimateLevel;
  high?: FeeEstimateLevel;
};

export type EstimateFeeBody = {
  destinationAddress: string;
  amount: string;
  tokenSymbol: "USDC";
};

export type CreateTransferBody = EstimateFeeBody & {
  feeLevel: FeeLevel;
  idempotencyKey: string;
};

export type TransactionPublic = {
  id: string;
  walletId: string;
  direction: string;
  blockchain: string;
  tokenSymbol: string;
  amount: string;
  sourceAddress: string;
  destinationAddress: string;
  state: string;
  txHash: string | null;
  networkFee: string | null;
  createdAt: string;
};

export type CreateTransferResponse = {
  transaction: TransactionPublic;
};
