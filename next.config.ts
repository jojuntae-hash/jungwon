import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // @ts-ignore - Some versions of NextConfig type might not have this yet
  allowedDevOrigins: ['192.168.50.207'],
};

export default nextConfig;
