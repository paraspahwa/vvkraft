/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@videoforge/ui", "@videoforge/shared"],
  serverExternalPackages: ["pg", "bullmq", "ioredis"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fal.run",
      },
      {
        protocol: "https",
        hostname: "**.backblazeb2.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((o) => o.trim())
    : [],
};

export default nextConfig;
