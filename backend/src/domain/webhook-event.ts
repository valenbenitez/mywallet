export type WebhookProvider = 'circle';

export interface WebhookEvent {
  id: string;
  provider: WebhookProvider;
  externalEventId: string;
  externalSubscriptionId: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  processedAt: Date | null;
  processingError: string | null;
  createdAt: Date;
}
