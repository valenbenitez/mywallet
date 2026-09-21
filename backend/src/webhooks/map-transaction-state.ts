import { TransactionState } from '../generated/prisma/client.js';

/**
 * Maps Circle transaction `state` strings to our Prisma enum.
 * Circle docs sometimes use COMPLETED; our schema uses COMPLETE.
 */
export function mapCircleTransactionState(state: string): TransactionState {
  const normalized = state.trim().toUpperCase();
  switch (normalized) {
    case 'INITIATED':
      return TransactionState.INITIATED;
    case 'QUEUED':
      return TransactionState.QUEUED;
    case 'CLEARED':
      return TransactionState.CLEARED;
    case 'SENT':
      return TransactionState.SENT;
    case 'STUCK':
      return TransactionState.STUCK;
    case 'CONFIRMED':
      return TransactionState.CONFIRMED;
    case 'COMPLETE':
    case 'COMPLETED':
      return TransactionState.COMPLETE;
    case 'CANCELLED':
    case 'CANCELED':
      return TransactionState.CANCELLED;
    case 'FAILED':
      return TransactionState.FAILED;
    case 'DENIED':
      return TransactionState.DENIED;
    default:
      throw new Error(`Unsupported Circle transaction state: ${state}`);
  }
}
