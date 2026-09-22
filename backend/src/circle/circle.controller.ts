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
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CircleService } from './circle.service.js';
import { CreateWalletSetDto } from './dto/create-wallet-set.dto.js';
import { OpsTokenGuard } from './ops-token.guard.js';

@ApiTags('Ops')
@ApiSecurity('ops-token')
@Controller('ops/wallet-sets')
@UseGuards(OpsTokenGuard)
export class CircleController {
  constructor(private readonly circleService: CircleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a Circle wallet set' })
  @ApiCreatedResponse({ description: 'Created wallet set' })
  createWalletSet(@Body() body: CreateWalletSetDto) {
    if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
      throw new BadRequestException('name is required');
    }
    return this.circleService.createWalletSet(body.name.trim());
  }

  @Get()
  @ApiOperation({ summary: 'List Circle wallet sets' })
  @ApiOkResponse({ description: 'Wallet set list' })
  listWalletSets() {
    return this.circleService.listWalletSets();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Circle wallet set by id' })
  @ApiParam({ name: 'id', description: 'Circle wallet set id' })
  @ApiOkResponse({ description: 'Wallet set detail' })
  getWalletSet(@Param('id') id: string) {
    return this.circleService.getWalletSet(id);
  }
}
