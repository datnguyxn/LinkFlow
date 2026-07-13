import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  //output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  experimental: {
    turbo: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx'],
    },
  },
};

export default nextConfig;
