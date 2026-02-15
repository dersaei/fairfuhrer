// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./supabase-image-loader.ts",
  },
  async headers() {
    return [
      {
        source: "/styles/atmosphere-v2.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Content-Type",
            value: "application/json; charset=utf-8",
          },
        ],
      },
      // cache dla obrazków
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // 24h cache
          },
        ],
      },
    ];
  },
};

export default nextConfig;