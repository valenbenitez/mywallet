import { BadRequestException } from '@nestjs/common';

export type TransactionCursor = {
  createdAt: string;
  id: string;
};

/**
 * Opaque cursor for createdAt DESC + id DESC pagination.
 * Encodes `{ createdAt ISO, id }` as base64url JSON.
 */
export function encodeTransactionCursor(createdAt: Date, id: string): string {
  const payload: TransactionCursor = {
    createdAt: createdAt.toISOString(),
    id,
  };
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeTransactionCursor(cursor: string): TransactionCursor {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as TransactionCursor).createdAt !== 'string' ||
      typeof (parsed as TransactionCursor).id !== 'string' ||
      Number.isNaN(Date.parse((parsed as TransactionCursor).createdAt))
    ) {
      throw new Error('invalid shape');
    }
    return parsed as TransactionCursor;
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}
