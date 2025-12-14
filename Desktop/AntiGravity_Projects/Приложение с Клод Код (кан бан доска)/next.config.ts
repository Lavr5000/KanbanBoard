import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Specify output file tracing root to avoid lockfile warnings
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
