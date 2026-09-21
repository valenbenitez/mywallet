import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CircleService } from './circle.service.js';
import { CreateWalletSetDto } from './dto/create-wallet-set.dto.js';
import { OpsTokenGuard } from './ops-token.guard.js';

@Controller('ops/wallet-sets')
@UseGuards(OpsTokenGuard)
export class CircleController {
  constructor(private readonly circleService: CircleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createWalletSet(@Body() body: CreateWalletSetDto) {
    if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
      throw new BadRequestException('name is required');
    }
    return this.circleService.createWalletSet(body.name.trim());
  }

  @Get()
  listWalletSets() {
    return this.circleService.listWalletSets();
  }

  @Get(':id')
  getWalletSet(@Param('id') id: string) {
    return this.circleService.getWalletSet(id);
  }
}
