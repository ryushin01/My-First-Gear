import type { NextConfig } from "next";

/**
 * 모든 응답에 붙이는 보안 헤더. 다른 사이트가 화면을 iframe으로 겹쳐 누르게 하는 클릭재킹, MIME 추측, 주소 유출을 막는다.
 * Next의 인라인 스크립트 때문에 script-src까지 막는 전체 CSP는 넣지 않는다(nonce를 쓰면 모든 화면이 요청마다 렌더링된다).
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  transpilePackages: ["@mfg/catalog", "@mfg/gear-art", "@mfg/db", "@mfg/hooks"],
  // 공유 이미지(OG)에 쓰는 한글 글꼴 파일을 서버 함수에 함께 넣는다.
  outputFileTracingIncludes: {
    "/product/[slug]/opengraph-image": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
    "/opengraph-image": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
    "/api/og/build": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
    "/api/og/setup": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
