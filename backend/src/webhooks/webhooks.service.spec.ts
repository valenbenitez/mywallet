import { UnauthorizedException } from '@nestjs/common';
import {
  generateKeyPairSync,
  sign,
} from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CircleService } from '../circle/circle.service.js';
import {
  Prisma,
  TransactionDirection,
  TransactionState,
  WalletBlockchain,
  WalletState,
  WebhookProvider,
  type Transaction,
  type Wallet,
  type WebhookEvent,
} from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import {
  cachePublicKey,
  clearCirclePublicKeyCache,
  getCachedPublicKey,
} from './circle-signature.js';
import { WebhooksService } from './webhooks.service.js';

const WALLET_ID = '22222222-2222-2222-2222-222222222222';
const CIRCLE_WALLET_ID = 'ce714f5b-0d8e-4062-9454-61aa1154869b';
const TX_ID = '33333333-3333-3333-3333-333333333333';
const CIRCLE_TX_ID = '2f4b6bcd-a752-5d8b-996b-92e3e04bd33b';
const EVENT_ID = '44444444-4444-4444-4444-444444444444';
const NOTIFICATION_ID = '05b3f4e5-ec27-44b8-aa40-3698577f6d92';
const KEY_ID = '879dc113-5ca4-4ff7-a6b7-54652083fcf8';

function makeWallet(overrides: Partial<Wallet> = {}): Wallet {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: WALLET_ID,
    userId: '11111111-1111-1111-1111-111111111111',
    circleWalletId: CIRCLE_WALLET_ID,
    address: '0x075e62c80e55d024cfd8fd4e3d1184834461db57',
    blockchain: WalletBlockchain.MATIC_AMOY,
    accountType: 'EOA',
    state: WalletState.LIVE,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: TX_ID,
    walletId: WALLET_ID,
    circleTransactionId: CIRCLE_TX_ID,
    idempotencyKey: 'idem-1',
    direction: TransactionDirection.OUTBOUND,
    blockchain: WalletBlockchain.MATIC_AMOY,
    tokenId: 'tok-usdc',
    tokenSymbol: 'USDC',
    amount: '10.00',
    sourceAddress: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
    destinationAddress: '0x1111111111111111111111111111111111111111',
    state: TransactionState.INITIATED,
    txHash: null,
    networkFee: null,
    errorReason: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeWebhookEvent(overrides: Partial<WebhookEvent> = {}): WebhookEvent {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: EVENT_ID,
    provider: WebhookProvider.circle,
    externalEventId: NOTIFICATION_ID,
    externalSubscriptionId: 'sub-1',
    eventType: 'transactions.inbound',
    payload: {},
    processedAt: null,
    processingError: null,
    createdAt: now,
    ...overrides,
  };
}

describe('WebhooksService', () => {
  let prisma: {
    wallet: { findUnique: ReturnType<typeof vi.fn> };
    transaction: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    webhookEvent: {
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let circleService: {
    getNotificationPublicKey: ReturnType<typeof vi.fn>;
  };
  let service: WebhooksService;
  let privateKey: ReturnType<typeof generateKeyPairSync>['privateKey'];
  let publicKeySpki: string;

  beforeEach(() => {
    clearCirclePublicKeyCache();
    process.env.CIRCLE_USDC_TOKEN_ID_MATIC = 'tok-usdc-matic';
    process.env.CIRCLE_USDC_TOKEN_ID_ETH = 'tok-usdc-eth';
    process.env.CIRCLE_API_KEY = 'test-api-key';
    process.env.CIRCLE_ENTITY_SECRET =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.CIRCLE_WALLET_SET_ID = 'wallet-set-1';
    process.env.CIRCLE_OPS_TOKEN = 'ops-token';

    const pair = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    privateKey = pair.privateKey;
    publicKeySpki = pair.publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('base64');

    prisma = {
      wallet: { findUnique: vi.fn() },
      transaction: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      webhookEvent: {
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    circleService = {
      getNotificationPublicKey: vi.fn().mockResolvedValue({
        id: KEY_ID,
        algorithm: 'ECDSA_SHA_256',
        publicKey: publicKeySpki,
      }),
    };
    service = new WebhooksService(
      prisma as unknown as PrismaService,
      circleService as unknown as CircleService,
    );
  });

  function signBody(rawBody: Buffer): string {
    return sign('sha256', rawBody, privateKey).toString('base64');
  }

  describe('assertValidSignature', () => {
    it('accepts a valid signature and caches the public key', async () => {
      const rawBody = Buffer.from('{"hello":"world"}', 'utf8');
      const signature = signBody(rawBody);

      await expect(
        service.assertValidSignature(rawBody, signature, KEY_ID),
      ).resolves.toBeUndefined();

      expect(circleService.getNotificationPublicKey).toHaveBeenCalledWith(KEY_ID);
      expect(getCachedPublicKey(KEY_ID)).toBeDefined();

      // Second call should use cache
      await service.assertValidSignature(rawBody, signature, KEY_ID);
      expect(circleService.getNotificationPublicKey).toHaveBeenCalledTimes(1);
    });

    it('rejects missing headers with 401', async () => {
      await expect(
        service.assertValidSignature(Buffer.from('x'), undefined, KEY_ID),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.assertValidSignature(Buffer.from('x'), 'sig', undefined),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects invalid signature with 401', async () => {
      cachePublicKey(KEY_ID, publicKeySpki);
      await expect(
        service.assertValidSignature(
          Buffer.from('payload'),
          Buffer.from('bad').toString('base64'),
          KEY_ID,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when public key lookup fails', async () => {
      circleService.getNotificationPublicKey.mockRejectedValue(
        new Error('upstream down'),
      );
      await expect(
        service.assertValidSignature(Buffer.from('x'), 'sig', KEY_ID),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('handleCircleWebhook', () => {
    it('returns ok without reprocessing when WebhookEvent already exists', async () => {
      prisma.webhookEvent.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      const rawBody = Buffer.from(
        JSON.stringify({
          notificationId: NOTIFICATION_ID,
          notificationType: 'transactions.inbound',
          notification: { id: CIRCLE_TX_ID, state: 'COMPLETE' },
        }),
        'utf8',
      );

      await expect(service.handleCircleWebhook(rawBody)).resolves.toEqual({
        ok: true,
      });
      expect(prisma.transaction.upsert).not.toHaveBeenCalled();
      expect(prisma.webhookEvent.update).not.toHaveBeenCalled();
    });

    it('creates INBOUND transaction and marks processedAt', async () => {
      prisma.webhookEvent.create.mockResolvedValue(makeWebhookEvent());
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.transaction.upsert.mockResolvedValue(
        makeTx({ direction: TransactionDirection.INBOUND }),
      );
      prisma.webhookEvent.update.mockResolvedValue(
        makeWebhookEvent({ processedAt: new Date() }),
      );

      const payload = {
        subscriptionId: 'sub-1',
        notificationId: NOTIFICATION_ID,
        notificationType: 'transactions.inbound',
        notification: {
          id: CIRCLE_TX_ID,
          blockchain: 'MATIC-AMOY',
          walletId: CIRCLE_WALLET_ID,
          tokenId: 'tok-usdc-matic',
          destinationAddress: '0x075e62c80e55d024cfd8fd4e3d1184834461db57',
          amounts: ['10'],
          state: 'COMPLETED',
          transactionType: 'INBOUND',
          txHash: '0xabc',
          networkFee: '0.01',
        },
      };
      const rawBody = Buffer.from(JSON.stringify(payload), 'utf8');

      await expect(service.handleCircleWebhook(rawBody)).resolves.toEqual({
        ok: true,
      });

      expect(prisma.webhookEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          provider: WebhookProvider.circle,
          externalEventId: NOTIFICATION_ID,
          eventType: 'transactions.inbound',
        }),
      });
      expect(prisma.transaction.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { circleTransactionId: CIRCLE_TX_ID },
          create: expect.objectContaining({
            direction: TransactionDirection.INBOUND,
            state: TransactionState.COMPLETE,
            amount: '10',
            tokenSymbol: 'USDC',
            txHash: '0xabc',
            networkFee: '0.01',
          }),
        }),
      );
      expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
        where: { id: EVENT_ID },
        data: {
          processedAt: expect.any(Date),
          processingError: null,
        },
      });
    });

    it('updates existing OUTBOUND transaction state/txHash/networkFee/errorReason', async () => {
      prisma.webhookEvent.create.mockResolvedValue(
        makeWebhookEvent({ eventType: 'transactions.outbound' }),
      );
      prisma.transaction.findUnique.mockResolvedValue(makeTx());
      prisma.transaction.update.mockResolvedValue(
        makeTx({
          state: TransactionState.COMPLETE,
          txHash: '0xhash',
          networkFee: '0.07',
        }),
      );
      prisma.webhookEvent.update.mockResolvedValue(
        makeWebhookEvent({ processedAt: new Date() }),
      );

      const payload = {
        notificationId: NOTIFICATION_ID,
        notificationType: 'transactions.outbound',
        notification: {
          id: CIRCLE_TX_ID,
          blockchain: 'MATIC-AMOY',
          state: 'COMPLETE',
          txHash: '0xhash',
          networkFee: '0.07',
          errorReason: null,
        },
      };

      await expect(
        service.handleCircleWebhook(Buffer.from(JSON.stringify(payload), 'utf8')),
      ).resolves.toEqual({ ok: true });

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: TX_ID },
        data: {
          state: TransactionState.COMPLETE,
          txHash: '0xhash',
          networkFee: '0.07',
          errorReason: null,
        },
      });
    });

    it('still returns ok and marks processedAt when outbound tx is missing', async () => {
      prisma.webhookEvent.create.mockResolvedValue(
        makeWebhookEvent({ eventType: 'transactions.outbound' }),
      );
      prisma.transaction.findUnique.mockResolvedValue(null);
      prisma.webhookEvent.update.mockResolvedValue(
        makeWebhookEvent({
          processedAt: new Date(),
          processingError: 'missing',
        }),
      );

      const payload = {
        notificationId: NOTIFICATION_ID,
        notificationType: 'transactions.outbound',
        notification: {
          id: CIRCLE_TX_ID,
          blockchain: 'MATIC-AMOY',
          state: 'FAILED',
          errorReason: 'Insufficient balance',
        },
      };

      await expect(
        service.handleCircleWebhook(Buffer.from(JSON.stringify(payload), 'utf8')),
      ).resolves.toEqual({ ok: true });

      expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
        where: { id: EVENT_ID },
        data: {
          processedAt: expect.any(Date),
          processingError: expect.stringContaining('No local OUTBOUND'),
        },
      });
    });

    it('returns ok for malformed JSON without throwing', async () => {
      await expect(
        service.handleCircleWebhook(Buffer.from('not-json', 'utf8')),
      ).resolves.toEqual({ ok: true });
      expect(prisma.webhookEvent.create).not.toHaveBeenCalled();
    });
  });
});
