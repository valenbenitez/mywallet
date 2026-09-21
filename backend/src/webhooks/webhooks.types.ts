export type CircleWebhookEnvelope = {
  subscriptionId?: string;
  notificationId: string;
  notificationType: string;
  notification: CircleTransactionNotification | Record<string, unknown>;
  timestamp?: string;
  version?: number;
};

export type CircleTransactionNotification = {
  id: string;
  blockchain: string;
  walletId?: string;
  tokenId?: string;
  tokenSymbol?: string;
  sourceAddress?: string;
  destinationAddress?: string;
  amounts?: string[];
  state: string;
  transactionType?: string;
  txHash?: string | null;
  networkFee?: string | null;
  errorReason?: string | null;
};

export function isCircleTransactionNotification(
  value: unknown,
): value is CircleTransactionNotification {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.id === 'string' && typeof obj.state === 'string';
}
