import { createPublicKey, verify, type KeyObject } from 'node:crypto';

const publicKeyCache = new Map<string, KeyObject>();

/** Clears the in-memory public-key cache (tests only). */
export function clearCirclePublicKeyCache(): void {
  publicKeyCache.clear();
}

export function getCachedPublicKey(keyId: string): KeyObject | undefined {
  return publicKeyCache.get(keyId);
}

export function cachePublicKey(keyId: string, publicKeyBase64: string): KeyObject {
  const publicKey = createPublicKey({
    key: Buffer.from(publicKeyBase64, 'base64'),
    format: 'der',
    type: 'spki',
  });
  publicKeyCache.set(keyId, publicKey);
  return publicKey;
}

/**
 * Verifies Circle webhook ECDSA SHA-256 signature over the raw body.
 * @see https://developers.circle.com/wallets/webhook-notifications
 */
export function verifyCircleSignature(input: {
  publicKey: KeyObject;
  signatureBase64: string;
  rawBody: Buffer;
}): boolean {
  try {
    const signatureBytes = Buffer.from(input.signatureBase64, 'base64');
    return verify('sha256', input.rawBody, input.publicKey, signatureBytes);
  } catch {
    return false;
  }
}
