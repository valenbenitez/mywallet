import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service.js';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Public Circle webhook endpoint (no JWT).
   * Verifies X-Circle-Signature with public key from X-Circle-Key-Id.
   */
  @Post('circle')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Circle webhook receiver',
    description:
      'Public endpoint (no JWT). Verifies ECDSA signature over the raw body.',
  })
  @ApiHeader({
    name: 'X-Circle-Signature',
    required: true,
    description: 'ECDSA signature of the raw request body',
  })
  @ApiHeader({
    name: 'X-Circle-Key-Id',
    required: true,
    description: 'Circle public key id used to verify the signature',
  })
  @ApiOkResponse({ description: 'Webhook accepted' })
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
