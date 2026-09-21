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
  @IsOptional()
  @IsUUID('4')
  walletId?: string;

  @IsOptional()
  @IsIn([...DIRECTIONS])
  direction?: TransactionDirection;

  @IsOptional()
  @IsIn([...STATES])
  state?: TransactionState;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}
