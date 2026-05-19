import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force no caching globally — semua request selalu fresh dari server
  fetchCache: "force-no-store",

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
