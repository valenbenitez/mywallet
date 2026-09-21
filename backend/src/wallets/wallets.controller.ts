import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { WalletsService } from './wallets.service.js';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.walletsService.listForUser(user.id);
  }

  /** Declare before `:id` so `/wallets/:id/balances` is not swallowed. */
  @Get(':id/balances')
  getBalances(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.walletsService.getBalancesForUser(user.id, id);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.walletsService.getForUser(user.id, id);
  }
}
