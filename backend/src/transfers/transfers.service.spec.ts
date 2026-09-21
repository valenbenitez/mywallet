import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CircleService } from '../circle/circle.service.js';
import {
  Prisma,
  TransactionDirection,
  TransactionState,
  WalletBlockchain,
  WalletState,
  type Transaction,
  type Wallet,
} from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { TransfersService } from './transfers.service.js';

const USER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_USER_ID = '99999999-9999-9999-9999-999999999999';
const WALLET_ID = '22222222-2222-2222-2222-222222222222';
const TX_ID = '33333333-3333-3333-3333-333333333333';
const DEST = '0x1111111111111111111111111111111111111111';

function makeWallet(overrides: Partial<Wallet> = {}): Wallet {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: WALLET_ID,
    userId: USER_ID,
    circleWalletId: 'circle-wallet-1',
    address: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
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
    circleTransactionId: null,
    idempotencyKey: 'idem-1',
    direction: TransactionDirection.OUTBOUND,
    blockchain: WalletBlockchain.MATIC_AMOY,
    tokenId: 'tok-usdc',
    tokenSymbol: 'USDC',
    amount: '10.00',
    sourceAddress: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
    destinationAddress: DEST,
    state: TransactionState.INITIATED,
    txHash: null,
    networkFee: null,
    errorReason: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('TransfersService', () => {
  let prisma: {
    wallet: { findUnique: ReturnType<typeof vi.fn> };
    transaction: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let circleService: {
    estimateFee: ReturnType<typeof vi.fn>;
    createTransfer: ReturnType<typeof vi.fn>;
    getUsdcTokenId: ReturnType<typeof vi.fn>;
    getBalances: ReturnType<typeof vi.fn>;
  };
  let service: TransfersService;

  beforeEach(() => {
    process.env.TRANSFER_MIN_USDC = '5';
    process.env.TRANSFER_MAX_USDC = '15000';

    prisma = {
      wallet: { findUnique: vi.fn() },
      transaction: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    circleService = {
      estimateFee: vi.fn(),
      createTransfer: vi.fn(),
      getUsdcTokenId: vi.fn().mockReturnValue('tok-usdc'),
      getBalances: vi.fn().mockResolvedValue([
        { tokenId: 'tok-usdc', tokenSymbol: 'USDC', amount: '100.00' },
      ]),
    };
    service = new TransfersService(
      prisma as unknown as PrismaService,
      circleService as unknown as CircleService,
    );
  });

  describe('estimateFee', () => {
    it('returns low/medium/high fee strings and does not create Transaction', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      circleService.estimateFee.mockResolvedValue({
        low: { networkFee: '0.001', gasLimit: '21000' },
        medium: { networkFee: '0.002', gasLimit: '21000' },
        high: { networkFee: '0.003', gasLimit: '21000' },
      });

      const result = await service.estimateFee(USER_ID, WALLET_ID, {
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
      });

      expect(circleService.getUsdcTokenId).toHaveBeenCalledWith('MATIC-AMOY');
      expect(circleService.estimateFee).toHaveBeenCalledWith({
        circleWalletId: 'circle-wallet-1',
        destinationAddress: DEST,
        amount: '10.00',
        tokenId: 'tok-usdc',
      });
      expect(prisma.transaction.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        low: { networkFee: '0.001', gasLimit: '21000' },
        medium: { networkFee: '0.002', gasLimit: '21000' },
        high: { networkFee: '0.003', gasLimit: '21000' },
      });
      expect(typeof result.low?.networkFee).toBe('string');
    });

    it('rejects amount below TRANSFER_MIN_USDC', async () => {
      await expect(
        service.estimateFee(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '4.99',
          tokenSymbol: 'USDC',
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'TRANSFER_MIN_USDC' }),
      });
      expect(prisma.wallet.findUnique).not.toHaveBeenCalled();
    });

    it('rejects amount above TRANSFER_MAX_USDC', async () => {
      await expect(
        service.estimateFee(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '15000.01',
          tokenSymbol: 'USDC',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns 403 when wallet belongs to another user', async () => {
      prisma.wallet.findUnique.mockResolvedValue(
        makeWallet({ userId: OTHER_USER_ID }),
      );
      await expect(
        service.estimateFee(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(circleService.estimateFee).not.toHaveBeenCalled();
    });

    it('returns 404 when wallet missing', async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);
      await expect(
        service.estimateFee(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createTransfer', () => {
    it('creates OUTBOUND INITIATED Transaction, calls Circle with idempotencyKey, returns public shape', async () => {
      const wallet = makeWallet();
      const created = makeTx({ idempotencyKey: 'client-key' });
      const updated = makeTx({
        idempotencyKey: 'client-key',
        circleTransactionId: 'circle-tx-1',
      });
      prisma.wallet.findUnique.mockResolvedValue(wallet);
      prisma.transaction.findUnique.mockResolvedValue(null);
      prisma.transaction.create.mockResolvedValue(created);
      prisma.transaction.update.mockResolvedValue(updated);
      circleService.createTransfer.mockResolvedValue({
        id: 'circle-tx-1',
        state: 'INITIATED',
      });

      const result = await service.createTransfer(USER_ID, WALLET_ID, {
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
        feeLevel: 'MEDIUM',
        idempotencyKey: 'client-key',
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          walletId: WALLET_ID,
          idempotencyKey: 'client-key',
          direction: TransactionDirection.OUTBOUND,
          tokenSymbol: 'USDC',
          amount: '10.00',
          state: TransactionState.INITIATED,
          destinationAddress: DEST,
        }),
      });
      expect(circleService.createTransfer).toHaveBeenCalledWith({
        circleWalletId: 'circle-wallet-1',
        destinationAddress: DEST,
        amount: '10.00',
        tokenId: 'tok-usdc',
        feeLevel: 'MEDIUM',
        idempotencyKey: 'client-key',
      });
      expect(result.transaction).toEqual({
        id: TX_ID,
        walletId: WALLET_ID,
        direction: 'OUTBOUND',
        blockchain: 'MATIC-AMOY',
        tokenSymbol: 'USDC',
        amount: '10.00',
        sourceAddress: wallet.address,
        destinationAddress: DEST,
        state: 'INITIATED',
        txHash: null,
        networkFee: null,
        createdAt: created.createdAt,
      });
      expect(typeof result.transaction.amount).toBe('string');
    });

    it('generates idempotencyKey when client omits it', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.transaction.findUnique.mockResolvedValue(null);
      prisma.transaction.create.mockImplementation(async ({ data }) =>
        makeTx({ idempotencyKey: data.idempotencyKey as string }),
      );
      prisma.transaction.update.mockImplementation(async ({ data }) =>
        makeTx({
          circleTransactionId: data.circleTransactionId as string,
        }),
      );
      circleService.createTransfer.mockResolvedValue({
        id: 'circle-tx-2',
        state: 'INITIATED',
      });

      await service.createTransfer(USER_ID, WALLET_ID, {
        destinationAddress: DEST,
        amount: '10.00',
        tokenSymbol: 'USDC',
        feeLevel: 'LOW',
      });

      const createArg = prisma.transaction.create.mock.calls[0][0];
      expect(createArg.data.idempotencyKey).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(circleService.createTransfer.mock.calls[0][0].idempotencyKey).toBe(
        createArg.data.idempotencyKey,
      );
    });

    it('returns 409 when idempotencyKey already used', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.transaction.findUnique.mockResolvedValue(makeTx());

      await expect(
        service.createTransfer(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
          feeLevel: 'HIGH',
          idempotencyKey: 'dup-key',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(circleService.createTransfer).not.toHaveBeenCalled();
    });

    it('returns 409 on Prisma unique race for idempotencyKey', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.transaction.findUnique.mockResolvedValue(null);
      prisma.transaction.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.createTransfer(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
          feeLevel: 'MEDIUM',
          idempotencyKey: 'race-key',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('returns 422 when USDC balance is insufficient', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.transaction.findUnique.mockResolvedValue(null);
      circleService.getBalances.mockResolvedValue([
        { tokenId: 'tok-usdc', tokenSymbol: 'USDC', amount: '1.00' },
      ]);

      await expect(
        service.createTransfer(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
          feeLevel: 'MEDIUM',
          idempotencyKey: 'bal-key',
        }),
      ).rejects.toBeInstanceOf(UnprocessableEntityException);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it('marks Transaction FAILED and rethrows when Circle fails', async () => {
      prisma.wallet.findUnique.mockResolvedValue(makeWallet());
      prisma.transaction.findUnique.mockResolvedValue(null);
      prisma.transaction.create.mockResolvedValue(makeTx());
      prisma.transaction.update.mockResolvedValue(makeTx({ state: 'FAILED' }));
      circleService.createTransfer.mockRejectedValue(
        new BadGatewayException('Circle upstream error: boom'),
      );

      await expect(
        service.createTransfer(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
          feeLevel: 'MEDIUM',
          idempotencyKey: 'fail-key',
        }),
      ).rejects.toBeInstanceOf(BadGatewayException);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: TX_ID },
        data: expect.objectContaining({
          state: TransactionState.FAILED,
        }),
      });
    });

    it('returns 403 for non-owner', async () => {
      prisma.wallet.findUnique.mockResolvedValue(
        makeWallet({ userId: OTHER_USER_ID }),
      );
      await expect(
        service.createTransfer(USER_ID, WALLET_ID, {
          destinationAddress: DEST,
          amount: '10.00',
          tokenSymbol: 'USDC',
          feeLevel: 'MEDIUM',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
