import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsString, Matches } from 'class-validator';

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const DECIMAL_AMOUNT_RE = /^\d+(\.\d+)?$/;

export class EstimateFeeDto {
  @ApiProperty({
    example: '0x1111111111111111111111111111111111111111',
    description: 'EVM destination address',
  })
  @IsString()
  @Matches(EVM_ADDRESS_RE, {
    message: 'destinationAddress must be a valid EVM address',
  })
  destinationAddress!: string;

  @ApiProperty({
    example: '1.50',
    description: 'Decimal string amount (not a float)',
  })
  @IsString()
  @Matches(DECIMAL_AMOUNT_RE, {
    message: 'amount must be a decimal string',
  })
  amount!: string;

  @ApiProperty({ enum: ['USDC'], example: 'USDC' })
  @Equals('USDC', { message: 'tokenSymbol must be USDC' })
  tokenSymbol!: 'USDC';
}
