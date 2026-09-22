import {
  BadGatewayException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import {
  CircleService,
  type CircleWalletSummary,
} from '../circle/circle.service.js';
import {
  Prisma,
  WalletAccountType,
  WalletState,
  type User,
  type Wallet,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { toApiBlockchain, toPrismaBlockchain } from './blockchain.map.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignupDto } from './dto/signup.dto.js';
import type {
  AuthUserPublic,
  AuthUserWithCreatedAt,
  AuthWalletPublic,
  JwtPayload,
  LoginResult,
  SignupResult,
} from './auth.types.js';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly circleService: CircleService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<SignupResult> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    let user: User;
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }

    let circleWallets: CircleWalletSummary[];
    try {
      circleWallets = await this.circleService.createWallets({
        idempotencyKey: `${user.id}`,
        refId: user.id,
      });
    } catch (error) {
      await this.compensateOrphanUser(user.id);
      throw error;
    }
    if (!circleWallets || circleWallets.length < 2) {
      await this.compensateOrphanUser(user.id);
      throw new BadGatewayException({
        statusCode: 502,
        error: 'Bad Gateway',
        message: 'Circle createWallets returned incomplete wallet set',
      });
    }

    let wallets: Wallet[];
    try {
      wallets = await this.persistWallets(user.id, circleWallets);
    } catch (error) {
      await this.compensateOrphanUser(user.id);
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException({
        statusCode: 502,
        error: 'Bad Gateway',
        message: 'Failed to persist Circle wallets after signup',
      });
    }

    return {
      user: toUserWithCreatedAt(user),
      accessToken: await this.signAccessToken(user),
      wallets: wallets.map(toWalletPublic),
    };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: toUserPublic(user),
      accessToken: await this.signAccessToken(user),
    };
  }

  async getMe(userId: string): Promise<AuthUserPublic> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return toUserPublic(user);
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }

  /**
   * Compensating delete: cascade removes wallets if any were persisted.
   * Ensures signup never leaves a user without the MVP wallet pair.
   */
  private async compensateOrphanUser(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } }).catch(() => {
      // Best-effort compensation; original error is rethrown by caller.
    });
  }

  private async persistWallets(
    userId: string,
    circleWallets: CircleWalletSummary[],
  ): Promise<Wallet[]> {
    const data = circleWallets.map((wallet) => {
      let blockchain;
      try {
        blockchain = toPrismaBlockchain(wallet.blockchain);
      } catch {
        throw new BadGatewayException({
          statusCode: 502,
          error: 'Bad Gateway',
          message: `Unsupported Circle blockchain: ${wallet.blockchain}`,
        });
      }

      const state =
        wallet.state === 'FROZEN' ? WalletState.FROZEN : WalletState.LIVE;

      return {
        id: randomUUID(),
        userId,
        circleWalletId: wallet.id,
        address: wallet.address,
        blockchain,
        accountType: WalletAccountType.EOA,
        state,
      };
    });

    await this.prisma.wallet.createMany({ data });
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { blockchain: 'asc' },
    });
  }
}

function toUserPublic(user: User): AuthUserPublic {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

function toUserWithCreatedAt(user: User): AuthUserWithCreatedAt {
  return {
    ...toUserPublic(user),
    createdAt: user.createdAt,
  };
}

function toWalletPublic(wallet: Wallet): AuthWalletPublic {
  return {
    id: wallet.id,
    address: wallet.address,
    blockchain: toApiBlockchain(wallet.blockchain),
    state: wallet.state,
  };
}
