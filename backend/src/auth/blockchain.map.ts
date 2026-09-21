import { WalletBlockchain as PrismaWalletBlockchain } from '../generated/prisma/client.js';
import type { WalletBlockchain } from '../domain/wallet.js';

const CIRCLE_TO_PRISMA: Record<string, PrismaWalletBlockchain> = {
  'MATIC-AMOY': PrismaWalletBlockchain.MATIC_AMOY,
  'ETH-SEPOLIA': PrismaWalletBlockchain.ETH_SEPOLIA,
};

const PRISMA_TO_API: Record<PrismaWalletBlockchain, WalletBlockchain> = {
  MATIC_AMOY: 'MATIC-AMOY',
  ETH_SEPOLIA: 'ETH-SEPOLIA',
};

export function toPrismaBlockchain(
  circleBlockchain: string,
): PrismaWalletBlockchain {
  const mapped = CIRCLE_TO_PRISMA[circleBlockchain];
  if (!mapped) {
    throw new Error(`Unsupported Circle blockchain: ${circleBlockchain}`);
  }
  return mapped;
}

export function toApiBlockchain(
  prismaBlockchain: PrismaWalletBlockchain,
): WalletBlockchain {
  return PRISMA_TO_API[prismaBlockchain];
}
