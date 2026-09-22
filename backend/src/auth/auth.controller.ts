import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { RequestUser } from './auth.types.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create account and provision Circle wallet' })
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT access token' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  /** Stateless logout: FE discards the token; no denylist. */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (client discards JWT; no server denylist)' })
  @ApiNoContentResponse()
  logout(): void {
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Current authenticated user (auth session)' })
  @ApiOkResponse({ description: 'Authenticated user profile' })
  me(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.id);
  }
}
