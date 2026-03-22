/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@videoforge/ui", "@videoforge/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fal.run",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin", "bullmq", "ioredis"],
  },
};

export default nextConfig;
