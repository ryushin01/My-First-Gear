import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["**/app/**", "**/*.stories.tsx", "**/*.test.ts"],
  },
  {
    rules: {
      // Next.js에서는 계층 이름을 _app, _pages로 쓴다. (Next의 app/, pages/ 폴더와 겹치지 않게)
      "fsd/typo-in-layer-name": "off",
      // 페이지마다 기능을 슬라이스로 나눠 스토리와 테스트를 붙이므로 참조가 하나여도 유지한다.
      "fsd/insignificant-slice": "off",
    },
  },
]);
