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
    ],
  },
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return { beforeFiles: [] };
    }
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:8080/api/v1/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
