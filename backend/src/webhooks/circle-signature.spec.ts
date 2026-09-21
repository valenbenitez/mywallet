import {
  generateKeyPairSync,
  sign,
} from 'node:crypto';
import {
  cachePublicKey,
  clearCirclePublicKeyCache,
  getCachedPublicKey,
  verifyCircleSignature,
} from './circle-signature.js';

describe('circle-signature', () => {
  beforeEach(() => {
    clearCirclePublicKeyCache();
  });

  it('verifies a valid ECDSA SHA-256 signature over raw body', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    const rawBody = Buffer.from(
      '{"notificationId":"evt-1","notificationType":"webhooks.test"}',
      'utf8',
    );
    const signatureBase64 = sign('sha256', rawBody, privateKey).toString('base64');

    expect(
      verifyCircleSignature({
        publicKey,
        signatureBase64,
        rawBody,
      }),
    ).toBe(true);
  });

  it('rejects tampered body or bad signature', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    const rawBody = Buffer.from('{"ok":true}', 'utf8');
    const signatureBase64 = sign('sha256', rawBody, privateKey).toString('base64');

    expect(
      verifyCircleSignature({
        publicKey,
        signatureBase64,
        rawBody: Buffer.from('{"ok":false}', 'utf8'),
      }),
    ).toBe(false);

    expect(
      verifyCircleSignature({
        publicKey,
        signatureBase64: Buffer.from('not-a-sig').toString('base64'),
        rawBody,
      }),
    ).toBe(false);
  });

  it('caches DER public keys by key id', () => {
    const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const spki = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
    const keyId = '879dc113-5ca4-4ff7-a6b7-54652083fcf8';

    expect(getCachedPublicKey(keyId)).toBeUndefined();
    const cached = cachePublicKey(keyId, spki);
    expect(getCachedPublicKey(keyId)).toBe(cached);
    expect(cached.type).toBe('public');
  });

  it('loads Circle-style base64 SPKI public key', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    const spkiBase64 = publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('base64');
    const loaded = cachePublicKey('key-1', spkiBase64);
    const rawBody = Buffer.from('payload', 'utf8');
    const signatureBase64 = sign('sha256', rawBody, privateKey).toString('base64');

    expect(
      verifyCircleSignature({
        publicKey: loaded,
        signatureBase64,
        rawBody,
      }),
    ).toBe(true);
  });
});
