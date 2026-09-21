import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CircleModule } from '../circle/circle.module.js';
import { TransfersController } from './transfers.controller.js';
import { TransfersService } from './transfers.service.js';

@Module({
  imports: [AuthModule, CircleModule],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
