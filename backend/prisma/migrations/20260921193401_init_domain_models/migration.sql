-- CreateEnum
CREATE TYPE "WalletBlockchain" AS ENUM ('MATIC-AMOY', 'ETH-SEPOLIA');

-- CreateEnum
CREATE TYPE "WalletState" AS ENUM ('LIVE', 'FROZEN');

-- CreateEnum
CREATE TYPE "WalletAccountType" AS ENUM ('EOA');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "TransactionState" AS ENUM ('INITIATED', 'QUEUED', 'CLEARED', 'SENT', 'STUCK', 'CONFIRMED', 'COMPLETE', 'CANCELLED', 'FAILED', 'DENIED');

-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('circle');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "circleWalletId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "blockchain" "WalletBlockchain" NOT NULL,
    "accountType" "WalletAccountType" NOT NULL DEFAULT 'EOA',
    "state" "WalletState" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "circleTransactionId" TEXT,
    "idempotencyKey" TEXT,
    "direction" "TransactionDirection" NOT NULL,
    "blockchain" "WalletBlockchain" NOT NULL,
    "tokenId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "sourceAddress" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "state" "TransactionState" NOT NULL,
    "txHash" TEXT,
    "networkFee" TEXT,
    "errorReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "externalSubscriptionId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_circleWalletId_key" ON "wallets"("circleWalletId");

-- CreateIndex
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_blockchain_key" ON "wallets"("userId", "blockchain");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_circleTransactionId_key" ON "transactions"("circleTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_idempotencyKey_key" ON "transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "transactions_walletId_createdAt_idx" ON "transactions"("walletId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "transactions_state_idx" ON "transactions"("state");

-- CreateIndex
CREATE INDEX "webhook_events_processedAt_idx" ON "webhook_events"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_externalEventId_key" ON "webhook_events"("provider", "externalEventId");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
