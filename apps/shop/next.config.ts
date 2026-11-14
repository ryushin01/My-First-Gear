import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@mfg/catalog", "@mfg/gear-art", "@mfg/db", "@mfg/hooks"],
  // 공유 이미지(OG)에 쓰는 한글 글꼴 파일을 서버 함수에 함께 넣는다.
  outputFileTracingIncludes: {
    "/product/[slug]/opengraph-image": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
    "/opengraph-image": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
    "/api/og/build": ["./node_modules/pretendard/dist/public/static/Pretendard-Bold.otf"],
  },
};

export default nextConfig;
