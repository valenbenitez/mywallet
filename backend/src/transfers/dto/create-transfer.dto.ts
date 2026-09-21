import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { EstimateFeeDto } from './estimate-fee.dto.js';
import type { FeeLevelPublic } from '../transfers.types.js';

export class CreateTransferDto extends EstimateFeeDto {
  @IsIn(['LOW', 'MEDIUM', 'HIGH'], {
    message: 'feeLevel must be LOW, MEDIUM, or HIGH',
  })
  feeLevel!: FeeLevelPublic;

  @IsOptional()
  @IsUUID('4')
  idempotencyKey?: string;
}
