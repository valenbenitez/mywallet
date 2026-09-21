import { Module } from '@nestjs/common';
import { CircleModule } from '../circle/circle.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';

@Module({
  imports: [PrismaModule, CircleModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
