/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // @ts-ignore
  allowedDevOrigins: ['192.168.50.207'],
};

export default nextConfig;
