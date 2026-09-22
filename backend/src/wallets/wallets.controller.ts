import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { WalletsService } from './wallets.service.js';

@ApiTags('Wallets')
@ApiBearerAuth('bearer')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'List wallets for the authenticated user' })
  @ApiOkResponse({ description: 'Wallet list' })
  list(@CurrentUser() user: RequestUser) {
    return this.walletsService.listForUser(user.id);
  }

  /** Declare before `:id` so `/wallets/:id/balances` is not swallowed. */
  @Get(':id/balances')
  @ApiOperation({ summary: 'Get token balances for a wallet' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Wallet balances (amounts as decimal strings)' })
  getBalances(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.walletsService.getBalancesForUser(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single wallet by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Wallet detail' })
  getOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.walletsService.getForUser(user.id, id);
  }
}
