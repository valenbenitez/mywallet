import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletSetDto {
  @ApiProperty({ example: 'beni-mvp-wallet-set' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
