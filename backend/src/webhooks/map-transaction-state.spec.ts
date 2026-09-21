import { TransactionState } from '../generated/prisma/client.js';
import { mapCircleTransactionState } from './map-transaction-state.js';

describe('mapCircleTransactionState', () => {
  it('maps standard Circle states to Prisma enum', () => {
    expect(mapCircleTransactionState('QUEUED')).toBe(TransactionState.QUEUED);
    expect(mapCircleTransactionState('COMPLETE')).toBe(TransactionState.COMPLETE);
    expect(mapCircleTransactionState('FAILED')).toBe(TransactionState.FAILED);
  });

  it('normalizes COMPLETED and CANCELED aliases', () => {
    expect(mapCircleTransactionState('COMPLETED')).toBe(TransactionState.COMPLETE);
    expect(mapCircleTransactionState('canceled')).toBe(TransactionState.CANCELLED);
  });

  it('throws on unknown state', () => {
    expect(() => mapCircleTransactionState('SOMETHING_ELSE')).toThrow(
      /Unsupported Circle transaction state/,
    );
  });
});
