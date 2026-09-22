import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { EstimateFeeDto } from './estimate-fee.dto.js';
import type { FeeLevelPublic } from '../transfers.types.js';

export class CreateTransferDto extends EstimateFeeDto {
  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM' })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'], {
    message: 'feeLevel must be LOW, MEDIUM, or HIGH',
  })
  feeLevel!: FeeLevelPublic;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Client-generated idempotency key',
  })
  @IsOptional()
  @IsUUID('4')
  idempotencyKey?: string;
}
