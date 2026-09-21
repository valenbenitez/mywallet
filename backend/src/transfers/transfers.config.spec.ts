import { afterEach, describe, expect, it } from 'vitest';
import { loadTransferLimits } from './transfers.config.js';

describe('loadTransferLimits', () => {
  const originalMin = process.env.TRANSFER_MIN_USDC;
  const originalMax = process.env.TRANSFER_MAX_USDC;

  afterEach(() => {
    if (originalMin === undefined) {
      delete process.env.TRANSFER_MIN_USDC;
    } else {
      process.env.TRANSFER_MIN_USDC = originalMin;
    }
    if (originalMax === undefined) {
      delete process.env.TRANSFER_MAX_USDC;
    } else {
      process.env.TRANSFER_MAX_USDC = originalMax;
    }
  });

  it('defaults to MVP 5–15000 when env unset', () => {
    delete process.env.TRANSFER_MIN_USDC;
    delete process.env.TRANSFER_MAX_USDC;
    expect(loadTransferLimits()).toEqual({
      minUsdc: '5',
      maxUsdc: '15000',
    });
  });

  it('reads TRANSFER_MIN_USDC and TRANSFER_MAX_USDC from env', () => {
    process.env.TRANSFER_MIN_USDC = '10';
    process.env.TRANSFER_MAX_USDC = '100';
    expect(loadTransferLimits()).toEqual({
      minUsdc: '10',
      maxUsdc: '100',
    });
  });
});
