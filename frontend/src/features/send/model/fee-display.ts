import type { FeeEstimateLevel, FeeEstimateResponse, FeeLevel } from "./types";

const LEVEL_KEYS: { feeLevel: FeeLevel; key: keyof FeeEstimateResponse }[] = [
  { feeLevel: "LOW", key: "low" },
  { feeLevel: "MEDIUM", key: "medium" },
  { feeLevel: "HIGH", key: "high" },
];

export type FeeLevelOption = {
  feeLevel: FeeLevel;
  networkFee: string;
  gasLimit?: string;
};

/** Flatten present estimate levels for preview UI. */
export function feeLevelOptions(
  estimate: FeeEstimateResponse,
): FeeLevelOption[] {
  const options: FeeLevelOption[] = [];
  for (const { feeLevel, key } of LEVEL_KEYS) {
    const level = estimate[key];
    if (level != null) {
      options.push({
        feeLevel,
        networkFee: level.networkFee,
        gasLimit: level.gasLimit,
      });
    }
  }
  return options;
}

/** Prefer MEDIUM when present; otherwise first available level. */
export function defaultFeeLevel(
  estimate: FeeEstimateResponse,
): FeeLevel | null {
  const options = feeLevelOptions(estimate);
  if (options.length === 0) return null;
  return (
    options.find((o) => o.feeLevel === "MEDIUM")?.feeLevel ??
    options[0]!.feeLevel
  );
}

export function formatNetworkFee(level: FeeEstimateLevel): string {
  return `${level.networkFee} network fee`;
}
