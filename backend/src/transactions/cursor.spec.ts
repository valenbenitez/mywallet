import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  decodeTransactionCursor,
  encodeTransactionCursor,
} from './cursor.js';

describe('transaction cursor', () => {
  it('round-trips createdAt and id', () => {
    const createdAt = new Date('2026-03-15T12:34:56.789Z');
    const id = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

    const encoded = encodeTransactionCursor(createdAt, id);
    expect(decodeTransactionCursor(encoded)).toEqual({
      createdAt: '2026-03-15T12:34:56.789Z',
      id,
    });
  });

  it('rejects invalid cursor with 400', () => {
    expect(() => decodeTransactionCursor('not-valid')).toThrow(
      BadRequestException,
    );
    expect(() =>
      decodeTransactionCursor(
        Buffer.from(JSON.stringify({ foo: 1 }), 'utf8').toString('base64url'),
      ),
    ).toThrow(BadRequestException);
  });
});
