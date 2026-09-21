import { Equals, IsString, Matches } from 'class-validator';

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const DECIMAL_AMOUNT_RE = /^\d+(\.\d+)?$/;

export class EstimateFeeDto {
  @IsString()
  @Matches(EVM_ADDRESS_RE, {
    message: 'destinationAddress must be a valid EVM address',
  })
  destinationAddress!: string;

  @IsString()
  @Matches(DECIMAL_AMOUNT_RE, {
    message: 'amount must be a decimal string',
  })
  amount!: string;

  @Equals('USDC', { message: 'tokenSymbol must be USDC' })
  tokenSymbol!: 'USDC';
}
