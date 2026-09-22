import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
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
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import { TransactionsService } from './transactions.service.js';

@ApiTags('Transactions')
@ApiBearerAuth('bearer')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions for the authenticated user' })
  @ApiOkResponse({ description: 'Paginated transaction list' })
  list(
    @CurrentUser() user: RequestUser,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.transactionsService.listForUser(user.id, {
      walletId: query.walletId,
      direction: query.direction,
      state: query.state,
      limit: query.limit ?? 20,
      cursor: query.cursor,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Transaction detail' })
  getOne(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.getForUser(user.id, id);
  }
}
