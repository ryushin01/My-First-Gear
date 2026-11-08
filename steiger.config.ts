import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["**/app/**", "**/*.test.ts", "**/*.test.tsx"],
  },
  {
    rules: {
      // Next.js에서는 계층 이름을 _app, _pages로 쓴다. (Next의 app/, pages/ 폴더와 겹치지 않게)
      "fsd/typo-in-layer-name": "off",
    },
  },
]);
