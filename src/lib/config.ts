import { config as loadEnv } from 'dotenv';

// Load env from .env.local (same source the DB connection uses).
loadEnv({ path: '.env.local' });

// Secret "pepper" mixed into every password hash. Keep this out of the DB and
// rotate it carefully — changing it invalidates all existing hashes.
const ENCODE_KEY = process.env.ENCODE_KEY;

if (!ENCODE_KEY) {
  throw new Error('ENCODE_KEY is not set');
}

export const config = {
  encodeKey: ENCODE_KEY,
};
