import { afterEach, describe, expect, it } from 'vitest';
import { loadAuthEnv } from './auth.config.js';

describe('loadAuthEnv', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpires = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
    if (originalExpires === undefined) {
      delete process.env.JWT_EXPIRES_IN;
    } else {
      process.env.JWT_EXPIRES_IN = originalExpires;
    }
  });

  it('loads JWT_SECRET and defaults expires to 7d', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.JWT_EXPIRES_IN;
    expect(loadAuthEnv()).toEqual({
      jwtSecret: 'test-secret',
      jwtExpiresIn: '7d',
    });
  });

  it('throws when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    expect(() => loadAuthEnv()).toThrow(/JWT_SECRET/);
  });
});
