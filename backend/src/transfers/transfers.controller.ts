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
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { RequestUser } from '../auth/auth.types.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { EstimateFeeDto } from './dto/estimate-fee.dto.js';
import { TransfersService } from './transfers.service.js';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  /** Declare before `:id/transfers` so nested path is not swallowed. */
  @Post(':id/transfers/estimate-fee')
  @HttpCode(HttpStatus.OK)
  estimateFee(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EstimateFeeDto,
  ) {
    return this.transfersService.estimateFee(user.id, id, dto);
  }

  @Post(':id/transfers')
  @HttpCode(HttpStatus.CREATED)
  createTransfer(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTransferDto,
  ) {
    return this.transfersService.createTransfer(user.id, id, dto);
  }
}
