import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configure for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/QRetro' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/QRetro/' : '',
};

export default nextConfig;
