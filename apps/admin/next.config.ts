import type { NextConfig } from "next";

/** 모든 응답에 붙이는 보안 헤더 (쇼핑몰과 같다). 어드민은 검색 엔진에도 노출하지 않는다. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

// 어드민은 요청마다 DB를 읽는 동적 화면이라 Cache Components를 쓰지 않는다.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@mfg/catalog", "@mfg/db", "@mfg/hooks"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
