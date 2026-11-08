import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Pages Router용 규칙이라 App Router 모노레포에서는 실행 위치에 따라 결과가 달라진다.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  {
    // OG 이미지 생성기(Satori)는 <img>만 받는다.
    files: ["src/shared/lib/og/**", "src/_app/seo/**", "src/_pages/*/api/ogImage.tsx", "src/_pages/*/api/shareImage.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
