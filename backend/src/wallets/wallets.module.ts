import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CircleModule } from '../circle/circle.module.js';
import { WalletsController } from './wallets.controller.js';
import { WalletsService } from './wallets.service.js';

@Module({
  imports: [AuthModule, CircleModule],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
