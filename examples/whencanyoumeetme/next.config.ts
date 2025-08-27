import type { NextConfig } from 'next';
import * as path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
};

export default nextConfig;
