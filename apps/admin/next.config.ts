import type { NextConfig } from "next";

// 어드민은 요청마다 DB를 읽는 동적 화면이라 Cache Components를 쓰지 않는다.
const nextConfig: NextConfig = {
  transpilePackages: ["@mfg/catalog", "@mfg/gear-art", "@mfg/db", "@mfg/hooks"],
  // 어드민은 검색 엔진에 노출하지 않는다.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
