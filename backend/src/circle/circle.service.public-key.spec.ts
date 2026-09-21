import { BadGatewayException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CircleService } from './circle.service.js';

describe('CircleService.getNotificationPublicKey', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.CIRCLE_API_KEY = 'test-api-key';
    process.env.CIRCLE_ENTITY_SECRET =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.CIRCLE_WALLET_SET_ID = 'wallet-set-1';
    process.env.CIRCLE_USDC_TOKEN_ID_MATIC = 'tok-matic';
    process.env.CIRCLE_USDC_TOKEN_ID_ETH = 'tok-eth';
    process.env.CIRCLE_OPS_TOKEN = 'ops';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('fetches public key by key id from Circle notifications API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: '879dc113-5ca4-4ff7-a6b7-54652083fcf8',
          algorithm: 'ECDSA_SHA_256',
          publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAETest==',
        },
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const service = Object.create(CircleService.prototype) as CircleService;
    const result = await service.getNotificationPublicKey(
      '879dc113-5ca4-4ff7-a6b7-54652083fcf8',
    );

    expect(result).toEqual({
      id: '879dc113-5ca4-4ff7-a6b7-54652083fcf8',
      algorithm: 'ECDSA_SHA_256',
      publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAETest==',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.circle.com/v2/notifications/publicKey/879dc113-5ca4-4ff7-a6b7-54652083fcf8',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
        }),
      }),
    );
  });

  it('maps non-OK responses to BadGatewayException', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as unknown as typeof fetch;

    const service = Object.create(CircleService.prototype) as CircleService;
    await expect(service.getNotificationPublicKey('bad-id')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
