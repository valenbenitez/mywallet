import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { JwtStrategy } from '../auth/jwt.strategy.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('UsersController (HTTP contract)', () => {
  let app: INestApplication;
  const usersService = {
    getMe: vi.fn(),
  };
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'users-controller-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'users-controller-test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
        JwtStrategy,
        JwtAuthGuard,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function authHeader(): Promise<string> {
    const { sign } = await import('jsonwebtoken');
    const token = sign(
      { sub: USER_ID, email: 'a@b.com' },
      'users-controller-test-secret',
    );
    prisma.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      passwordHash: 'x',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return `Bearer ${token}`;
  }

  it('GET /users/me returns 401 without Bearer token', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /users/me returns 401 with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer not-a-valid-jwt')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /users/me returns 200 profile shape without passwordHash', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    usersService.getMe.mockResolvedValue({
      id: USER_ID,
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      createdAt,
    });

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', await authHeader())
      .expect(HttpStatus.OK);

    expect(usersService.getMe).toHaveBeenCalledWith(USER_ID);
    expect(res.body).toEqual({
      id: USER_ID,
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      createdAt: createdAt.toISOString(),
    });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('rejects PATCH / DELETE users routes (not in this ticket)', async () => {
    const auth = await authHeader();

    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', auth)
      .send({ firstName: 'X' })
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', auth)
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .delete(`/users/${USER_ID}`)
      .set('Authorization', auth)
      .expect(HttpStatus.NOT_FOUND);
  });
});
