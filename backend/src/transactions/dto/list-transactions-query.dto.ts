import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import type {
  TransactionDirection,
  TransactionState,
} from '../../domain/transaction.js';

const DIRECTIONS = ['INBOUND', 'OUTBOUND'] as const satisfies readonly TransactionDirection[];

const STATES = [
  'INITIATED',
  'QUEUED',
  'CLEARED',
  'SENT',
  'STUCK',
  'CONFIRMED',
  'COMPLETE',
  'CANCELLED',
  'FAILED',
  'DENIED',
] as const satisfies readonly TransactionState[];

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  walletId?: string;

  @ApiPropertyOptional({ enum: DIRECTIONS })
  @IsOptional()
  @IsIn([...DIRECTIONS])
  direction?: TransactionDirection;

  @ApiPropertyOptional({ enum: STATES })
  @IsOptional()
  @IsIn([...STATES])
  state?: TransactionState;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Opaque pagination cursor from a previous response',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
