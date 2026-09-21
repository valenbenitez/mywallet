import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  let service: UsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UsersService(prisma as unknown as PrismaService);
  });

  describe('getMe', () => {
    it('returns public profile with createdAt and without passwordHash', async () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      prisma.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        passwordHash: 'secret-hash',
        createdAt,
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      const result = await service.getMe(USER_ID);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_ID },
      });
      expect(result).toEqual({
        id: USER_ID,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException when user is missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe(USER_ID)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
