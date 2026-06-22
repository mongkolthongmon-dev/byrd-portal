import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The `pg` driver is a native Node module; keep it external from the
  // server bundle so it loads correctly in the Node.js runtime on Vercel.
  serverExternalPackages: ['pg'],
};

export default nextConfig;
