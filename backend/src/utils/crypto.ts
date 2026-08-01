import crypto from 'crypto';

/** Generate a high-entropy URL-safe random token (raw, unhashed). */
export function generateRawToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** Deterministic SHA-256 hash used to store tokens at rest (never store raw). */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
