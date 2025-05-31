import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oockmooumzncrvkrjkcc.supabase.co",
        pathname: "/storage/v1/object/public/media-files/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Dodaj cache headers dla pliku atmosphere.json
  async headers() {
    return [
      {
        source: "/styles/atmosphere.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31, immutable",
          },
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
