import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next가 등록한 jsx-a11y 플러그인을 그대로 쓴다. 플러그인을 다시 등록하면 중복 오류가 난다.
const jsxA11y = nextVitals.find((config) => config.plugins?.["jsx-a11y"])?.plugins?.["jsx-a11y"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next는 jsx-a11y 규칙을 몇 개만 켠다. recommended 규칙을 모두 켠다.
    files: ["**/*.{jsx,tsx}"],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // 가로로 스크롤되는 영역은 키보드로 스크롤할 수 있게 이름을 가진 region에 tabIndex={0}을 준다.
      "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: [], roles: ["tabpanel", "region"] }],
      // 레이블 글자가 label > span > span 안에 있는 선택지가 있어 찾는 깊이를 하나 늘린다.
      "jsx-a11y/label-has-associated-control": ["error", { depth: 3 }],
    },
  },
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
