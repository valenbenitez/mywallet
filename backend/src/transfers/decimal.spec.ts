import { describe, expect, it } from 'vitest';
import { compareDecimalStrings, isDecimalString } from './decimal.js';

describe('isDecimalString', () => {
  it('accepts non-negative decimals', () => {
    expect(isDecimalString('0')).toBe(true);
    expect(isDecimalString('5')).toBe(true);
    expect(isDecimalString('10.00')).toBe(true);
    expect(isDecimalString('15000.5')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isDecimalString('')).toBe(false);
    expect(isDecimalString('-1')).toBe(false);
    expect(isDecimalString('1e2')).toBe(false);
    expect(isDecimalString('abc')).toBe(false);
  });
});

describe('compareDecimalStrings', () => {
  it('compares without float coercion', () => {
    expect(compareDecimalStrings('5', '5.0')).toBe(0);
    expect(compareDecimalStrings('4.99', '5')).toBe(-1);
    expect(compareDecimalStrings('15000.01', '15000')).toBe(1);
    expect(compareDecimalStrings('10.50', '10.5')).toBe(0);
  });
});
