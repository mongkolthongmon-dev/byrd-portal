import { randomBytes, scryptSync, createHmac, timingSafeEqual } from 'node:crypto';
import { config } from './config';

// Password hashing mirrors neon-dev: scrypt key derivation with a per-user salt,
// then HMAC-SHA256 with the secret ENCODE_KEY pepper.
function hashPassword(password: string, salt: string): string {
  const derived = scryptSync(password, salt, 64);
  return createHmac('sha256', config.encodeKey).update(derived).digest('hex');
}

export function generateCredentials(password: string) {
  const passwordSalt = randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, passwordSalt);
  return { passwordHash, passwordSalt };
}

// Verify a plain password against a stored hash + salt, using a timing-safe
// comparison.
export function verifyPassword(
  user: { passwordHash: string | null; passwordSalt: string | null },
  password: string,
): boolean {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const candidate = hashPassword(password, user.passwordSalt);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(user.passwordHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
