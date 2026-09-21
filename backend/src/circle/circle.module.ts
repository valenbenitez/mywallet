import { Module } from '@nestjs/common';
import { CircleController } from './circle.controller.js';
import { CircleService } from './circle.service.js';
import { OpsTokenGuard } from './ops-token.guard.js';

@Module({
  controllers: [CircleController],
  providers: [CircleService, OpsTokenGuard],
  exports: [CircleService],
})
export class CircleModule {}
