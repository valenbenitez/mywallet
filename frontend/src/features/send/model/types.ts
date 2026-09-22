import type { WalletBalance } from "@/entities/wallet";
import type { TransactionPublic } from "@/features/transactions";

export type { TransactionPublic };

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

export type CreateTransferResponse = {
  transaction: TransactionPublic;
};
