export type CircleEnv = {
  apiKey: string;
  entitySecret: string;
  walletSetId: string;
  usdcTokenIdMatic: string;
  usdcTokenIdEth: string;
  opsToken: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Loads Circle server-only config. Never log returned values. */
export function loadCircleEnv(): CircleEnv {
  return {
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
    walletSetId: requireEnv('CIRCLE_WALLET_SET_ID'),
    usdcTokenIdMatic: requireEnv('CIRCLE_USDC_TOKEN_ID_MATIC'),
    usdcTokenIdEth: requireEnv('CIRCLE_USDC_TOKEN_ID_ETH'),
    opsToken: requireEnv('CIRCLE_OPS_TOKEN'),
  };
}

/** Ops endpoints need CIRCLE_OPS_TOKEN even before wallet set bootstrap. */
export function loadCircleOpsToken(): string {
  return requireEnv('CIRCLE_OPS_TOKEN');
}

/** API key + entity secret for client init (wallet set bootstrap before CIRCLE_WALLET_SET_ID). */
export function loadCircleClientCredentials(): {
  apiKey: string;
  entitySecret: string;
} {
  return {
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
  };
}

/** Wallet set used by createWallets (after ops bootstrap). */
export function loadCircleWalletSetId(): string {
  return requireEnv('CIRCLE_WALLET_SET_ID');
}
