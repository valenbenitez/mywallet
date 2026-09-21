export type TransferLimits = {
  minUsdc: string;
  maxUsdc: string;
};

const DEFAULT_MIN_USDC = '5';
const DEFAULT_MAX_USDC = '15000';

/** Loads transfer amount limits. Defaults match MVP (5–15000 USDC). */
export function loadTransferLimits(): TransferLimits {
  return {
    minUsdc: process.env.TRANSFER_MIN_USDC?.trim() || DEFAULT_MIN_USDC,
    maxUsdc: process.env.TRANSFER_MAX_USDC?.trim() || DEFAULT_MAX_USDC,
  };
}
