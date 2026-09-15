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
};

export default nextConfig;
