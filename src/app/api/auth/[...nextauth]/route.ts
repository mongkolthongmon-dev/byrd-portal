import { handlers } from '@/auth';

// DB access (pg) requires the Node.js runtime.
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
