import { defineConfig } from "drizzle-kit";

// 마이그레이션은 쇼핑몰(Netlify 사이트) 폴더에 둔다. Netlify가 배포할 때 적용한다.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "../../apps/shop/netlify/database/migrations",
  migrations: { prefix: "timestamp" },
});
