import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.lumacdn.com",
      },
      {
        protocol: "https",
        hostname: "images.0xw.app",
      },
      {
        protocol: "https",
        hostname: "kthais.com",
      },
      //TODO: remove this in production, only for development
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
