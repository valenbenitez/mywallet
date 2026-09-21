import { UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('loads user from JWT payload sub', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'u1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          passwordHash: 'x',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    };
    const strategy = new JwtStrategy(prisma as unknown as PrismaService);
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.com' }),
    ).resolves.toEqual({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
    });
  });

  it('rejects missing subject', async () => {
    const prisma = { user: { findUnique: vi.fn() } };
    const strategy = new JwtStrategy(prisma as unknown as PrismaService);
    await expect(
      strategy.validate({ sub: '', email: 'a@b.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects unknown user id', async () => {
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const strategy = new JwtStrategy(prisma as unknown as PrismaService);
    await expect(
      strategy.validate({ sub: 'missing', email: 'a@b.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
