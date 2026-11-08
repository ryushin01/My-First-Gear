import { defineConfig } from "drizzle-kit";

// 마이그레이션은 쇼핑몰 운영 배포(Vercel 빌드) 때 scripts/migrate.mjs가 적용한다.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  migrations: { prefix: "timestamp" },
});
