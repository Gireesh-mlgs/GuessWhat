import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.10.182.58",
    "10.*.*.*",
    "192.168.*.*",
    "172.*.*.*",
    "*.local",
    "localhost",
  ],
  async redirects() {
    return [
      {
        source: "/daily",
        destination: "/music/banger",
        permanent: false,
      },
      {
        source: "/unlimited",
        destination: "/music/banger?mode=unlimited",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
