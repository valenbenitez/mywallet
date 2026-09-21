const DECIMAL_RE = /^\d+(\.\d+)?$/;

/** True if value is a non-negative decimal string (no sign, no exponent). */
export function isDecimalString(value: string): boolean {
  return DECIMAL_RE.test(value);
}

/**
 * Compare two non-negative decimal strings without float coercion.
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareDecimalStrings(a: string, b: string): number {
  if (!isDecimalString(a) || !isDecimalString(b)) {
    throw new Error('Invalid decimal string');
  }
  const [aInt, aFrac = ''] = a.split('.');
  const [bInt, bFrac = ''] = b.split('.');
  const scale = Math.max(aFrac.length, bFrac.length);
  const aScaled = BigInt(stripLeadingZeros(aInt) + aFrac.padEnd(scale, '0'));
  const bScaled = BigInt(stripLeadingZeros(bInt) + bFrac.padEnd(scale, '0'));
  if (aScaled < bScaled) return -1;
  if (aScaled > bScaled) return 1;
  return 0;
}

function stripLeadingZeros(intPart: string): string {
  const stripped = intPart.replace(/^0+(?=\d)/, '');
  return stripped.length > 0 ? stripped : '0';
}
