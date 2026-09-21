import { describe, expect, it } from 'vitest';
import { WalletBlockchain } from '../generated/prisma/client.js';
import { toApiBlockchain, toPrismaBlockchain } from './blockchain.map.js';

describe('blockchain.map', () => {
  it('maps Circle blockchain strings to Prisma enums', () => {
    expect(toPrismaBlockchain('MATIC-AMOY')).toBe(WalletBlockchain.MATIC_AMOY);
    expect(toPrismaBlockchain('ETH-SEPOLIA')).toBe(
      WalletBlockchain.ETH_SEPOLIA,
    );
  });

  it('maps Prisma enums back to API blockchain strings', () => {
    expect(toApiBlockchain(WalletBlockchain.MATIC_AMOY)).toBe('MATIC-AMOY');
    expect(toApiBlockchain(WalletBlockchain.ETH_SEPOLIA)).toBe('ETH-SEPOLIA');
  });

  it('rejects unsupported Circle blockchains', () => {
    expect(() => toPrismaBlockchain('ETH')).toThrow(/Unsupported/);
  });
});
