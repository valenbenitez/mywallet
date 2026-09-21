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
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('AuthController (HTTP contract)', () => {
  let app: INestApplication;
  const authService = {
    signup: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
  };
  const prisma = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'controller-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'controller-test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
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

  it('POST /auth/signup returns 400 on validation failure', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(HttpStatus.BAD_REQUEST);
    expect(authService.signup).not.toHaveBeenCalled();
  });

  it('POST /auth/signup returns 201 body from service', async () => {
    authService.signup.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        createdAt: new Date('2026-01-01'),
      },
      accessToken: 'tok',
      wallets: [
        {
          id: 'w1',
          address: '0x1',
          blockchain: 'MATIC-AMOY',
          state: 'LIVE',
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'a@b.com',
        password: 'password1',
        firstName: 'A',
        lastName: 'B',
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.accessToken).toBe('tok');
    expect(res.body.user.email).toBe('a@b.com');
    expect(res.body.wallets).toHaveLength(1);
  });

  it('POST /auth/login returns 200 from service', async () => {
    authService.login.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B' },
      accessToken: 'tok',
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'password1' })
      .expect(HttpStatus.OK)
      .expect({
        user: { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B' },
        accessToken: 'tok',
      });
  });

  it('POST /auth/logout returns 401 without Bearer token', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('GET /auth/me returns 401 without Bearer token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST /auth/logout returns 204 with valid Bearer token', async () => {
    const { sign } = await import('jsonwebtoken');
    const token = sign(
      { sub: 'u1', email: 'a@b.com' },
      'controller-test-secret',
    );
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      passwordHash: 'x',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('GET /auth/me returns 200 user shape with valid Bearer token', async () => {
    const { sign } = await import('jsonwebtoken');
    const token = sign(
      { sub: 'u1', email: 'a@b.com' },
      'controller-test-secret',
    );
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      passwordHash: 'x',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    authService.getMe.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
    });

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
    });
  });

  it('exports JwtAuthGuard for other modules', () => {
    expect(new JwtAuthGuard()).toBeInstanceOf(JwtAuthGuard);
  });
});
