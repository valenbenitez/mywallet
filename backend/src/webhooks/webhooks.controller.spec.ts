import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebhooksController } from './webhooks.controller.js';
import type { WebhooksService } from './webhooks.service.js';

describe('WebhooksController', () => {
  let service: {
    assertValidSignature: ReturnType<typeof vi.fn>;
    handleCircleWebhook: ReturnType<typeof vi.fn>;
  };
  let controller: WebhooksController;

  beforeEach(() => {
    service = {
      assertValidSignature: vi.fn().mockResolvedValue(undefined),
      handleCircleWebhook: vi.fn().mockResolvedValue({ ok: true }),
    };
    controller = new WebhooksController(
      service as unknown as WebhooksService,
    );
  });

  it('verifies signature then processes raw body', async () => {
    const rawBody = Buffer.from('{"notificationId":"n1"}', 'utf8');
    const req = { rawBody } as Parameters<WebhooksController['handleCircle']>[0];

    await expect(
      controller.handleCircle(req, 'sig', 'key-id'),
    ).resolves.toEqual({ ok: true });

    expect(service.assertValidSignature).toHaveBeenCalledWith(
      rawBody,
      'sig',
      'key-id',
    );
    expect(service.handleCircleWebhook).toHaveBeenCalledWith(rawBody);
  });

  it('returns 401 when raw body is missing', async () => {
    const req = { rawBody: undefined } as Parameters<
      WebhooksController['handleCircle']
    >[0];

    await expect(
      controller.handleCircle(req, 'sig', 'key-id'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.assertValidSignature).not.toHaveBeenCalled();
  });
});
