import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 12;

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const NUMBER = '23456789';
const SPECIAL = '!@#$%^&*?-_=+';
const ALL = UPPER + LOWER + NUMBER + SPECIAL;

function randInt(max: number): number {
  return crypto.randomInt(0, max);
}

function pick(set: string): string {
  return set[randInt(set.length)];
}

/**
 * Generate a strong random password.
 * Guarantees >= 1 uppercase, lowercase, number and special char.
 * Default length 14 (>= the required 12).
 */
export function generateStrongPassword(length = 14): string {
  const len = Math.max(12, length);
  const required = [pick(UPPER), pick(LOWER), pick(NUMBER), pick(SPECIAL)];
  const rest: string[] = [];
  for (let i = required.length; i < len; i += 1) {
    rest.push(pick(ALL));
  }
  const chars = [...required, ...rest];
  // Fisher-Yates shuffle with CSPRNG
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function isStrongPassword(password: string): boolean {
  return PASSWORD_POLICY.test(password);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
