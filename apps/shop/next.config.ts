import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@mfg/catalog", "@mfg/gear-art", "@mfg/db"],
};

export default nextConfig;
