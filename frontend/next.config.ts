import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the Turbopack workspace root to silence the lockfile warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
