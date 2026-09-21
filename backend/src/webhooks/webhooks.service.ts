import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { toPrismaBlockchain } from '../auth/blockchain.map.js';
import { CircleService } from '../circle/circle.service.js';
import { loadCircleEnv } from '../circle/circle.config.js';
import {
  Prisma,
  TransactionDirection,
  WebhookProvider,
  type WalletBlockchain,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  cachePublicKey,
  getCachedPublicKey,
  verifyCircleSignature,
} from './circle-signature.js';
import { mapCircleTransactionState } from './map-transaction-state.js';
import {
  isCircleTransactionNotification,
  type CircleTransactionNotification,
  type CircleWebhookEnvelope,
} from './webhooks.types.js';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly circleService: CircleService,
  ) {}

  /**
   * Verifies Circle ECDSA signature over raw body using public key by keyId.
   * Throws UnauthorizedException on missing/invalid signature.
   */
  async assertValidSignature(
    rawBody: Buffer,
    signature: string | undefined,
    keyId: string | undefined,
  ): Promise<void> {
    if (!signature?.trim() || !keyId?.trim()) {
      throw new UnauthorizedException('Missing Circle signature headers');
    }

    let publicKey = getCachedPublicKey(keyId);
    if (!publicKey) {
      try {
        const fetched = await this.circleService.getNotificationPublicKey(keyId);
        publicKey = cachePublicKey(keyId, fetched.publicKey);
      } catch (error) {
        this.logger.warn(
          `Failed to fetch Circle notification public key for ${keyId}`,
        );
        throw new UnauthorizedException('Unable to verify Circle signature');
      }
    }

    const valid = verifyCircleSignature({
      publicKey,
      signatureBase64: signature,
      rawBody,
    });
    if (!valid) {
      throw new UnauthorizedException('Invalid Circle signature');
    }
  }

  /**
   * Idempotent webhook processing. Caller must have verified the signature.
   * Always resolves to `{ ok: true }` for valid signatures (no throw on business gaps).
   */
  async handleCircleWebhook(rawBody: Buffer): Promise<{ ok: true }> {
    let envelope: CircleWebhookEnvelope;
    try {
      envelope = JSON.parse(rawBody.toString('utf8')) as CircleWebhookEnvelope;
    } catch {
      this.logger.warn('Circle webhook body is not valid JSON');
      return { ok: true };
    }

    if (
      typeof envelope.notificationId !== 'string' ||
      !envelope.notificationId ||
      typeof envelope.notificationType !== 'string'
    ) {
      this.logger.warn('Circle webhook missing notificationId/notificationType');
      return { ok: true };
    }

    let webhookEventId: string;
    try {
      const created = await this.prisma.webhookEvent.create({
        data: {
          provider: WebhookProvider.circle,
          externalEventId: envelope.notificationId,
          externalSubscriptionId: envelope.subscriptionId ?? null,
          eventType: envelope.notificationType,
          payload: envelope as unknown as Prisma.InputJsonValue,
        },
      });
      webhookEventId = created.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { ok: true };
      }
      throw error;
    }

    let processingError: string | null = null;
    try {
      await this.processNotification(envelope);
    } catch (error) {
      processingError =
        error instanceof Error ? error.message : 'Webhook processing failed';
      this.logger.warn(
        `Webhook ${envelope.notificationId} processing error: ${processingError}`,
      );
    }

    await this.prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        processedAt: new Date(),
        processingError,
      },
    });

    return { ok: true };
  }

  private async processNotification(
    envelope: CircleWebhookEnvelope,
  ): Promise<void> {
    const { notificationType, notification } = envelope;

    if (
      notificationType === 'transactions.inbound' ||
      notificationType === 'transactions.outbound'
    ) {
      if (!isCircleTransactionNotification(notification)) {
        throw new Error('Transaction notification missing id/state');
      }
      if (notificationType === 'transactions.inbound') {
        await this.syncInbound(notification);
        return;
      }
      await this.syncOutbound(notification);
      return;
    }

    // webhooks.test and other types: acknowledge only
  }

  private async syncInbound(
    notification: CircleTransactionNotification,
  ): Promise<void> {
    if (!notification.walletId) {
      throw new Error('Inbound notification missing walletId');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { circleWalletId: notification.walletId },
    });
    if (!wallet) {
      throw new Error(
        `No local wallet for circleWalletId ${notification.walletId}`,
      );
    }

    const blockchain = toPrismaBlockchain(notification.blockchain);
    const amount = pickAmount(notification.amounts);
    const tokenId = notification.tokenId ?? '';
    const tokenSymbol = resolveTokenSymbol(
      blockchain,
      tokenId,
      notification.tokenSymbol,
    );
    const state = mapCircleTransactionState(notification.state);

    await this.prisma.transaction.upsert({
      where: { circleTransactionId: notification.id },
      create: {
        walletId: wallet.id,
        circleTransactionId: notification.id,
        direction: TransactionDirection.INBOUND,
        blockchain,
        tokenId,
        tokenSymbol,
        amount,
        sourceAddress: notification.sourceAddress ?? '',
        destinationAddress:
          notification.destinationAddress ?? wallet.address,
        state,
        txHash: notification.txHash ?? null,
        networkFee:
          notification.networkFee != null
            ? String(notification.networkFee)
            : null,
        errorReason: notification.errorReason ?? null,
      },
      update: {
        state,
        txHash: notification.txHash ?? null,
        networkFee:
          notification.networkFee != null
            ? String(notification.networkFee)
            : null,
        errorReason: notification.errorReason ?? null,
        amount,
        ...(notification.sourceAddress
          ? { sourceAddress: notification.sourceAddress }
          : {}),
        ...(notification.destinationAddress
          ? { destinationAddress: notification.destinationAddress }
          : {}),
      },
    });
  }

  private async syncOutbound(
    notification: CircleTransactionNotification,
  ): Promise<void> {
    const existing = await this.prisma.transaction.findUnique({
      where: { circleTransactionId: notification.id },
    });
    if (!existing) {
      throw new Error(
        `No local OUTBOUND transaction for circleTransactionId ${notification.id}`,
      );
    }

    const state = mapCircleTransactionState(notification.state);
    await this.prisma.transaction.update({
      where: { id: existing.id },
      data: {
        state,
        txHash: notification.txHash ?? null,
        networkFee:
          notification.networkFee != null
            ? String(notification.networkFee)
            : null,
        errorReason: notification.errorReason ?? null,
      },
    });
  }
}

function pickAmount(amounts: string[] | undefined): string {
  if (amounts && amounts.length > 0 && amounts[0] != null) {
    return String(amounts[0]);
  }
  return '0';
}

function resolveTokenSymbol(
  blockchain: WalletBlockchain,
  tokenId: string,
  explicit?: string,
): string {
  if (explicit?.trim()) {
    return explicit.trim();
  }
  try {
    const env = loadCircleEnv();
    if (
      (blockchain === 'MATIC_AMOY' && tokenId === env.usdcTokenIdMatic) ||
      (blockchain === 'ETH_SEPOLIA' && tokenId === env.usdcTokenIdEth)
    ) {
      return 'USDC';
    }
  } catch {
    // env may be incomplete in unit tests — fall through
  }
  return 'UNKNOWN';
}
