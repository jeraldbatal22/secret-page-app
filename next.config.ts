import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kympenflggsghugnrxsp.supabase.co',
        // Optionally specify pathname: "**" to match all paths, or be more specific.
        // pathname: "**"
      },
    ],
  },
};

export default nextConfig;
