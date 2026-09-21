import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service.js';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Public Circle webhook endpoint (no JWT).
   * Verifies X-Circle-Signature with public key from X-Circle-Key-Id.
   */
  @Post('circle')
  @HttpCode(200)
  async handleCircle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-circle-signature') signature?: string,
    @Headers('x-circle-key-id') keyId?: string,
  ): Promise<{ ok: true }> {
    const rawBody = req.rawBody;
    if (!rawBody || rawBody.length === 0) {
      throw new UnauthorizedException('Missing request body');
    }

    await this.webhooksService.assertValidSignature(rawBody, signature, keyId);
    return this.webhooksService.handleCircleWebhook(rawBody);
  }
}
