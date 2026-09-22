import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { EstimateFeeDto } from './dto/estimate-fee.dto.js';
import { TransfersService } from './transfers.service.js';

@ApiTags('Transfers')
@ApiBearerAuth('bearer')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  /** Declare before `:id/transfers` so nested path is not swallowed. */
  @Post(':id/transfers/estimate-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estimate network fee for a USDC transfer' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Source wallet id' })
  @ApiOkResponse({ description: 'Fee estimate levels (LOW/MEDIUM/HIGH)' })
  estimateFee(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EstimateFeeDto,
  ) {
    return this.transfersService.estimateFee(user.id, id, dto);
  }

  @Post(':id/transfers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a USDC transfer from a wallet' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Source wallet id' })
  @ApiCreatedResponse({ description: 'Created outbound transaction' })
  createTransfer(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTransferDto,
  ) {
    return this.transfersService.createTransfer(user.id, id, dto);
  }
}
